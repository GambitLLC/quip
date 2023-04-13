package director

import (
	"context"
	"log"
	"sync"
	"time"

	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
	"github.com/pkg/errors"
)

type Service struct {
	cfg     config.View
	backend *omBackendClient
	agones  *agonesAllocationClient
	store   statestore.Service
	broker  broker.Client
	pc      *games.MatchProfileCache
}

func New(cfg config.View) appmain.Daemon {
	return &Service{
		cfg:     cfg,
		backend: newOMBackendClient(cfg),
		agones:  newAgonesAllocationClient(cfg),
		store:   statestore.New(cfg),
		broker:  broker.NewRedis(cfg),
		pc:      games.NewMatchProfileCache(),
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

			log.Printf("Fetching matches for %d profiles", len(profiles))

			var wg sync.WaitGroup
			for _, p := range profiles {
				wg.Add(1)
				go func(wg *sync.WaitGroup, profile *ompb.MatchProfile) {
					defer wg.Done()

					ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
					defer cancel()

					matches, err := s.backend.FetchMatches(ctx, &ompb.FetchMatchesRequest{
						Config: &ompb.FunctionConfig{
							Host: s.cfg.GetString("matchmaker.matchfunction.hostname"),
							Port: s.cfg.GetInt32("matchmaker.matchfunction.port"),
							Type: ompb.FunctionConfig_GRPC,
						},
						Profile: profile,
					})

					if err != nil {
						log.Printf("failed to fetch matches for profile %s: %s", profile.Name, err.Error())
						return
					}

					log.Printf("Fetched %d matches for profile %s", len(matches), profile.Name)

					for _, match := range matches {
						if err := s.assignMatch(ctx, match); err != nil {
							log.Printf("failed to assign match '%s': %s", match.MatchId, err)
						}
					}
				}(&wg, p)
			}

			wg.Wait()
		}
	}
}

func (s *Service) assignMatch(ctx context.Context, match *ompb.Match) error {
	players := make([]string, len(match.Tickets))
	ticketIds := make([]string, len(match.Tickets))
	for i, ticket := range match.Tickets {
		ticketIds[i] = ticket.Id
		details := &ipb.TicketInternal{}
		err := ticket.Extensions["details"].UnmarshalTo(details)
		if err != nil {
			return errors.WithMessagef(err, "failed to read details on ticket '%s", ticket.Id)
		}

		players[i] = details.PlayerId
	}

	err := s.store.TrackMatch(ctx, match.MatchId, players)
	if err != nil {
		return errors.WithMessage(err, "failed to track match")
	}

	// TODO: remove all agones references from director -- director shall call backend.CreateMatch
	ip, err := s.agones.Allocate(ctx, match)
	if err != nil {
		// lazily untrack match and release tickets
		go func() {
			// TODO: handle error
			_ = s.store.UntrackMatch(ctx, players)
			// TODO: release tickets
		}()
		return errors.WithMessage(err, "failed to allocate gameserver")
	}

	err = s.store.CreateMatch(ctx, &ipb.MatchInternal{
		MatchId:    match.MatchId,
		Connection: ip,
		State:      ipb.MatchInternal_STATE_PENDING,
	})
	if err != nil {
		// lazily untrack match and release tickets
		go func() {
			// TODO: handle error
			_ = s.store.UntrackMatch(ctx, players)
			// TODO: release tickets
		}()
		return errors.WithMessage(err, "failed to store match in statestore")
	}

	go s.broker.PublishQueueUpdate(ctx, &pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Found{
			Found: &pb.MatchFound{
				Connection: ip,
			},
		},
	})

	go s.broker.PublishStatusUpdate(ctx, &pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_STATUS_PLAYING,
	})

	res, err := s.backend.AssignTickets(ctx, &ompb.AssignTicketsRequest{
		Assignments: []*ompb.AssignmentGroup{
			{
				TicketIds: ticketIds,
				Assignment: &ompb.Assignment{
					Connection: ip,
				},
			},
		},
	})
	if err != nil {
		return errors.Wrap(err, "AssignTickets failed")
	}

	// TODO: repeat assignment on error or failures?
	for _, failure := range res.Failures {
		log.Printf("failed to assign ticket %s", failure.TicketId)
	}

	return nil
}
