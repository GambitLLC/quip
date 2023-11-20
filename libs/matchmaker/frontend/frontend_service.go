package frontend

import (
	"context"
	"errors"
	"os"
	"sync"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"github.com/rs/zerolog"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.frontend").
	Logger()

type Service struct {
	sessionMapLock sync.RWMutex
	idToChan       map[string]chan *pb.Response

	games      *games.GameListingCache
	statestore statestore.Service
	omfc       *omFrontendClient

	// closed channel to prevent panics in tests
	closed chan struct{}
}

func New(cfg config.View) *Service {
	srv := &Service{
		idToChan:   make(map[string]chan *pb.Response),
		games:      games.NewGameListingCache(cfg.GetString("matchmaker.gamesFile")),
		statestore: statestore.New(cfg),
		omfc:       newOmFrontendClient(cfg),
		closed:     make(chan struct{}),
	}

	if err := srv.subscribeToMessages(cfg); err != nil {
		panic(err)
	}

	return srv
}

func (s *Service) Close() error {
	if s.closed != nil {
		// TODO: handle closing twice?
		close(s.closed)
	}

	return nil
}

// Connect is a long-lived rpc for clients to send queue actions and
// receive queue updates.
func (s *Service) Connect(srv pb.QuipFrontend_ConnectServer) error {
	session, err := s.createSession(srv)
	if err != nil {
		return err
	}

	defer s.deleteSession(session)

	go session.send()
	return session.recv()
}

// subscribeToMessages creates a new goroutine that will listen to StateUpdate
// and StatusUpdate messages from the broker and send them to the relevant
// sessions that are connected.
func (s *Service) subscribeToMessages(cfg config.View) error {
	rb := broker.NewRedisBroker(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stateSub := rb.SubscribeStateUpdate(ctx)
	if stateSub == nil {
		return errors.New("RedisBroker.SubscribeStateUpdate returned nil")
	}

	statusSub := rb.SubscribeStatusUpdate(ctx)
	if statusSub == nil {
		return errors.New("RedisBroker.SubscribeStatusUpdate returned nil")
	}

	go func() {
		for {
			select {
			case <-s.closed:
				// service closed

				// TODO: handle errors
				_ = stateSub.Close()
				_ = statusSub.Close()
				_ = rb.Close()
				return
			case msg, ok := <-stateSub.Channel():
				if !ok {
					panic("StateSubscription channel closed")
				}

				s.sessionMapLock.RLock()
				for _, id := range msg.Targets {
					ch, ok := s.idToChan[id]
					if !ok {
						// TODO: log channel doesn't exist
						continue
					}

					select {
					case ch <- &pb.Response{
						Message: &pb.Response_Player{
							Player: &pb.Player{
								Id:    id,
								State: msg.State,
							},
						},
					}:
					default:
						// TODO: log channel blocked
					}
				}
				s.sessionMapLock.RUnlock()
			case msg, ok := <-statusSub.Channel():
				if !ok {
					panic("StatusSubscription channel closed")
				}

				s.sessionMapLock.RLock()
				for _, id := range msg.Targets {
					ch, ok := s.idToChan[id]
					if !ok {
						// TODO: log channel doesn't exist
						continue
					}

					select {
					case ch <- &pb.Response{
						Message: &pb.Response_StatusUpdate{
							StatusUpdate: msg.Update,
						},
					}:
					default:
						// TODO: log channel blocked
					}
				}
				s.sessionMapLock.RUnlock()
			}
		}
	}()

	return nil
}

func (s *Service) createSession(srv pb.QuipFrontend_ConnectServer) (*session, error) {
	id := metautils.ExtractIncoming(srv.Context()).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is not set")
	}

	s.sessionMapLock.Lock()
	defer s.sessionMapLock.Unlock()

	ch := make(chan *pb.Response, 1)
	s.idToChan[id] = ch

	return &session{
		srv: srv,
		svc: s,
		id:  id,
		out: ch,
	}, nil
}

func (s *Service) deleteSession(sess *session) {
	s.sessionMapLock.Lock()
	defer s.sessionMapLock.Unlock()

	delete(s.idToChan, sess.id)
}
