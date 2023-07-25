package frontend

import (
	"context"
	"os"
	"time"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.frontend").
	Logger()

type Service struct {
	store statestore.Service
	omfc  *omFrontendClient
	gc    *games.GameDetailCache

	broker broker.Client

	// use channel as semaphore to synchronize access
	managerSemaphore chan *manager
}

func NewService(cfg config.View) *Service {
	mc := make(chan *manager, 1)
	mc <- &manager{
		idToChan: make(map[string][]chan *pb.Status),
		chanToId: make(map[<-chan *pb.Status]string),
	}

	return &Service{
		store:            statestore.New(cfg),
		omfc:             newOmFrontendClient(cfg),
		gc:               games.NewGameDetailCache(),
		broker:           broker.NewRedis(cfg),
		managerSemaphore: mc,
	}
}

func (s *Service) Stream(stream pb.Frontend_StreamServer) error {
	session, err := s.newSession(stream)
	if err != nil {
		return err
	}

	defer session.cleanup()

	go session.send()

	// recv returns when the client disconnects or closes the send direction of the stream
	// consider Stream finished in both cases
	return session.recv()
}

type manager struct {
	idToChan map[string][]chan *pb.Status
	chanToId map[<-chan *pb.Status]string

	close func() error
}

func (s *Service) subscribe(id string) (<-chan *pb.Status, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	manager := <-s.managerSemaphore
	if manager.close == nil {
		updates, close, err := s.broker.ConsumeStatusUpdate(ctx)
		if err != nil {
			return nil, errors.Wrap(err, "failed to consume status updates")
		}

		go func() {
			for update := range updates {
				manager := <-s.managerSemaphore
				for _, target := range update.Targets {
					for _, ch := range manager.idToChan[target] {
						select {
						case ch <- update.Status:
							// noop
						default:
							// channel blocked
							logger.Warn().Str("id", target).Msg("sending status update to channel was blocked")
						}
					}
				}
				s.managerSemaphore <- manager
			}

		}()

		manager.close = close
	}

	ch := make(chan *pb.Status, 1)
	manager.chanToId[ch] = id
	manager.idToChan[id] = append(manager.idToChan[id], ch)

	s.managerSemaphore <- manager
	return ch, nil
}

func (s *Service) unsubscribe(ch <-chan *pb.Status) {
	manager := <-s.managerSemaphore
	id, ok := manager.chanToId[ch]
	if !ok {
		s.managerSemaphore <- manager
		return
	}

	filter := manager.idToChan[id][:0]
	for _, other := range manager.idToChan[id] {
		if other != ch {
			filter = append(filter, other)
		}
	}

	// garbage collect
	for i := len(filter); i < len(manager.idToChan[id]); i++ {
		manager.idToChan[id] = nil
	}

	s.managerSemaphore <- manager
}
