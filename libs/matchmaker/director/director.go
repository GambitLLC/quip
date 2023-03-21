package director

import (
	"context"
	"log"
	"sync"
	"time"

	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
	"github.com/pkg/errors"
)

type Service struct {
	cfg     config.View
	backend *omBackendClient
	store   statestore.Service
	broker  broker.Client
}

func New(cfg config.View) *Service {
	return &Service{
		cfg:     cfg,
		backend: newOMBackendClient(cfg),
		store:   statestore.New(cfg),
		broker:  broker.NewRedis(cfg),
	}
}

// Start continuously fetches and assigns matches until input context is cancelled.
func (s *Service) Start(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	profiles := []*ompb.MatchProfile{}

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
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

					for _, match := range matches {
						s.assignMatch(ctx, match)
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
			return err
		}

		players[i] = details.PlayerId
	}

	err := s.store.TrackMatch(ctx, match.MatchId, players)
	if err != nil {
		return errors.WithMessage(err, "failed to track match")
	}

	// TODO: allocate a gameserver
	// if !allocated {
	// 	return errors.WithMessage(err, "failed to allocate gameserver")
	// }

	go s.broker.PublishQueueUpdate(ctx, &pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Found{
			Found: &pb.MatchDetails{
				Connection: "unimplemented",
			},
		},
	})

	go s.broker.PublishStatusUpdate(ctx, &pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_PLAYING,
	})

	res, err := s.backend.AssignTickets(ctx, &ompb.AssignTicketsRequest{
		Assignments: []*ompb.AssignmentGroup{
			{
				TicketIds: ticketIds,
				Assignment: &ompb.Assignment{
					Connection: "unimplemented",
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
