package director

import (
	"context"
	"os"
	"sync"
	"time"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.director").
	Logger()

type Service struct {
	cfg       config.View
	store     statestore.Service
	omBackend *omBackendClient
	backend   *backendClient
	broker    broker.Client
	pc        *games.MatchProfileCache
}

func New(cfg config.View) appmain.Daemon {
	return &Service{
		cfg:       cfg,
		store:     statestore.New(cfg),
		omBackend: newOMBackendClient(cfg),
		backend:   newBackendClient(cfg),
		broker:    broker.NewRedis(cfg),
		pc:        games.NewMatchProfileCache(),
	}
}

// Start continuously fetches and assigns matches until input context is cancelled.
func (s *Service) Start(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			profiles, err := s.pc.Profiles()
			if err != nil {
				return err
			}

			logger.Debug().Msgf("Fetching matches for %d profiles", len(profiles))

			var wg sync.WaitGroup
			for _, p := range profiles {
				wg.Add(1)
				go func(wg *sync.WaitGroup, profile *ompb.MatchProfile) {
					defer wg.Done()

					ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
					defer cancel()

					matches, err := s.omBackend.FetchMatches(ctx, &ompb.FetchMatchesRequest{
						Config: &ompb.FunctionConfig{
							Host: s.cfg.GetString("matchmaker.matchfunction.hostname"),
							Port: s.cfg.GetInt32("matchmaker.matchfunction.port"),
							Type: ompb.FunctionConfig_GRPC,
						},
						Profile: profile,
					})

					if err != nil {
						logger.Error().Err(err).Str("profile", profile.Name).Msg("Failed to fetch matches")
						return
					}

					logger.Debug().Msgf("Fetched %d matches for profile %s", len(matches), profile.Name)

					for _, match := range matches {
						if err := s.assignMatch(ctx, match); err != nil {
							logger.Error().Err(err).Str("match_id", match.MatchId).Msg("Failed to assign match")
						}
					}
				}(&wg, p)
			}

			wg.Wait()
		}
	}
}

func (s *Service) assignMatch(ctx context.Context, match *ompb.Match) error {
	gameCfg := &pb.GameConfiguration{}
	err := match.Extensions["game_config"].UnmarshalTo(gameCfg)
	if err != nil {
		return errors.WithMessage(err, "failed to parse game config")
	}

	matchDetails := &pb.MatchDetails{}
	err = match.Extensions["match_details"].UnmarshalTo(matchDetails)
	if err != nil {
		return errors.WithMessage(err, "failed to parse match details")
	}

	resp, err := s.backend.CreateMatch(ctx, &pb.CreateMatchRequest{
		MatchId:      match.MatchId,
		GameConfig:   gameCfg,
		MatchDetails: matchDetails,
	})

	if err != nil {
		// TODO: release tickets
		return err
	}

	ticketIds := make([]string, len(match.Tickets))
	for i, ticket := range match.Tickets {
		ticketIds[i] = ticket.Id
	}

	players := make([]string, 0, len(matchDetails.Teams))
	for _, team := range matchDetails.Teams {
		players = append(players, team.Players...)
	}

	go s.broker.PublishQueueUpdate(context.Background(), &pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Found{
			Found: &pb.MatchFound{
				MatchId:    match.MatchId,
				Connection: resp.Connection,
			},
		},
	})

	go s.broker.PublishStatusUpdate(context.Background(), &pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_STATUS_PLAYING,
	})

	res, err := s.omBackend.AssignTickets(ctx, &ompb.AssignTicketsRequest{
		Assignments: []*ompb.AssignmentGroup{
			{
				TicketIds: ticketIds,
				Assignment: &ompb.Assignment{
					Connection: resp.Connection,
				},
			},
		},
	})
	if err != nil {
		return errors.Wrap(err, "AssignTickets failed")
	}

	// TODO: repeat assignment on error or failures?
	for _, failure := range res.Failures {
		logger.Warn().Str("ticket_id", failure.TicketId).Msg("Failed to assign ticket")
	}

	return nil
}
