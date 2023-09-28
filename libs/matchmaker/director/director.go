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
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.director").
	Timestamp().
	Logger()

type Service struct {
	cfg          config.View
	store        statestore.Service
	omBackend    *omBackendClient
	agonesClient *agonesClient
	broker       *broker.RedisBroker
	profiles     *games.MatchProfileCache
}

func New(cfg config.View) appmain.Daemon {
	return &Service{
		cfg:          cfg,
		store:        statestore.New(cfg),
		omBackend:    newOMBackendClient(cfg),
		agonesClient: newAgonesClient(cfg),
		broker:       broker.NewRedisBroker(cfg),
		profiles:     games.NewMatchProfileCache(cfg.GetString("matchmaker.gamesFile")),
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
			profiles, err := s.profiles.Get()
			if err != nil {
				return err
			}

			logger.Debug().Msgf("Fetching matches for %d profiles", len(profiles))

			var wg sync.WaitGroup
			for _, p := range profiles {
				wg.Add(1)
				go func(wg *sync.WaitGroup, profile *ompb.MatchProfile) {
					defer wg.Done()

					ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
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
						if err := s.allocateMatch(ctx, match); err != nil {
							logger.Error().Err(err).Str("match_id", match.MatchId).Msg("Failed to allocate match")
						}
					}
				}(&wg, p)
			}

			wg.Wait()
		}
	}
}

func (s *Service) allocateMatch(ctx context.Context, match *ompb.Match) error {
	details, err := protoext.OpenMatchMatchDetails(match)
	if err != nil {
		return err
	}

	if details.GetMatchId() == "" {
		return errors.Errorf("match details is missing match id: %v", details)
	}

	if len(details.GetRoster().GetPlayers()) == 0 {
		return errors.Errorf("match details has zero length players: %v", details)
	}

	// TODO: is it necessary to get match response?
	_, err = s.agonesClient.Allocate(ctx)
	if err != nil {
		// Release tickets associated with match
		go func() {
			ticketIds := make([]string, len(match.Tickets))
			for i, ticket := range match.Tickets {
				ticketIds[i] = ticket.Id
			}
			_, err := s.omBackend.ReleaseTickets(context.Background(), &ompb.ReleaseTicketsRequest{
				TicketIds: ticketIds,
			})
			if err != nil {
				logger.Err(err).Msgf("failed to release tickets for unallocated match %s", match.MatchId)
			}
		}()
		return errors.WithMessagef(err, "failed to allocate gameserver for match %s", match.MatchId)
	}

	return nil
}
