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
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/matchmaker/games"
	"github.com/GambitLLC/quip/internal/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/internal/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.frontend").
	Logger()

var ErrNotConnected = status.Error(codes.FailedPrecondition, "Player is not connected")

type Service struct {
	pb.UnimplementedQuipFrontendServer

	sessionMapLock sync.RWMutex
	sessionMap     map[string]*session

	games      *games.GameListingCache
	statestore statestore.Service
	omfc       *omFrontendClient
	rb         *broker.RedisBroker

	// closed channel to prevent panics in tests
	closed chan struct{}
}

func New(cfg config.View) *Service {
	srv := &Service{
		sessionMap: make(map[string]*session),

		games:      games.NewGameListingCache(cfg.GetString("matchmaker.gamesFile")),
		statestore: statestore.New(cfg),
		omfc:       newOmFrontendClient(cfg),
		rb:         broker.NewRedisBroker(cfg),

		closed: make(chan struct{}),
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

	return s.rb.Close()
}

// Connect is a long-lived rpc for clients to send queue actions and
// receive queue updates.
func (s *Service) Connect(_ *emptypb.Empty, srv pb.QuipFrontend_ConnectServer) error {
	sess, err := s.createSession(srv)
	if err != nil {
		return err
	}

	defer s.deleteSession(sess.id)

	// Get player current state to send to connection
	player, err := sess.getPlayer(srv.Context())
	if err != nil {
		return err
	}
	sess.out <- &pb.PlayerUpdate{
		Player: player,
	}

	for {
		select {
		case err := <-sess.close:
			return err
		case <-srv.Context().Done():
			sess.cleanup()
			return nil
		case msg := <-sess.out:
			err := srv.Send(msg)
			if s, ok := status.FromError(err); ok {
				switch s.Code() {
				case codes.OK:
					// noop
				case codes.Canceled, codes.DeadlineExceeded:
					// client closed
					return nil
				default:
					logger.Err(s.Err()).Msg("stream.Send failed")
				}
			} else {
				logger.Err(err).Msg("stream.Send failed")
			}
		}
	}
}

func (s *Service) createSession(srv pb.QuipFrontend_ConnectServer) (*session, error) {
	id := metautils.ExtractIncoming(srv.Context()).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is not set")
	}

	s.sessionMapLock.Lock()
	defer s.sessionMapLock.Unlock()

	if oldSession, ok := s.sessionMap[id]; ok {
		select {
		case oldSession.close <- status.Error(codes.Aborted, "logged in from another device"):
			// no op
		default:
			return nil, status.Error(codes.Aborted, "failed to close pre-existing session")
		}
	}

	sess := &session{
		svc:   s,
		id:    id,
		out:   make(chan *pb.PlayerUpdate, 1),
		close: make(chan error, 1),
	}

	s.sessionMap[id] = sess

	return sess, nil
}

func (s *Service) deleteSession(id string) {
	s.sessionMapLock.Lock()
	defer s.sessionMapLock.Unlock()

	delete(s.sessionMap, id)
}

func (s *Service) GetPlayer(ctx context.Context, _ *pb.GetPlayerRequest) (*pb.Player, error) {
	id := metautils.ExtractIncoming(ctx).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is not set")
	}

	s.sessionMapLock.RLock()
	sess, ok := s.sessionMap[id]
	s.sessionMapLock.RUnlock()

	if !ok {
		return nil, ErrNotConnected
	}

	return sess.getPlayer(ctx)
}

func (s *Service) StartQueue(ctx context.Context, req *pb.StartQueueRequest) (*emptypb.Empty, error) {
	id := metautils.ExtractIncoming(ctx).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is not set")
	}

	s.sessionMapLock.RLock()
	sess, ok := s.sessionMap[id]
	s.sessionMapLock.RUnlock()

	if !ok {
		return nil, ErrNotConnected
	}

	return &emptypb.Empty{}, sess.startQueue(ctx, req)
}

func (s *Service) StopQueue(ctx context.Context, _ *pb.StopQueueRequest) (*emptypb.Empty, error) {
	id := metautils.ExtractIncoming(ctx).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is not set")
	}

	s.sessionMapLock.RLock()
	sess, ok := s.sessionMap[id]
	s.sessionMapLock.RUnlock()

	if !ok {
		return nil, ErrNotConnected
	}

	return &emptypb.Empty{}, sess.stopQueue(ctx)
}

// subscribeToMessages creates a new goroutine that will listen to StateUpdate
// and StatusUpdate messages from the broker and send them to the relevant
// sessions that are connected.
func (s *Service) subscribeToMessages(cfg config.View) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// stateSub := rb.SubscribeStateUpdate(ctx)
	// if stateSub == nil {
	// 	return errors.New("RedisBroker.SubscribeStateUpdate returned nil")
	// }

	statusSub := s.rb.SubscribeStatusUpdate(ctx)
	if statusSub == nil {
		return errors.New("RedisBroker.SubscribeStatusUpdate returned nil")
	}

	go func() {
		for {
			select {
			case <-s.closed:
				// TODO: handle errors
				// _ = stateSub.Close()
				_ = statusSub.Close()
				// _ = rb.Close()
				return
			case update, ok := <-statusSub.Channel():
				if !ok {
					panic("StatusSubscription channel closed")
				}

				s.sessionMapLock.RLock()
				for _, id := range update.GetTargets() {
					sess, ok := s.sessionMap[id]
					if !ok {
						continue
					}

					go func() {
						player, err := sess.getPlayer(context.TODO())
						if err != nil {
							logger.Err(err).Str("player", sess.id)
							return
						}

						sess.out <- &pb.PlayerUpdate{
							Player: player,
							Update: update.GetUpdate(),
						}
					}()
				}
				s.sessionMapLock.RUnlock()
			}

		}
	}()

	return nil
	// go func() {
	// 	for {
	// 		select {
	// 		case <-s.closed:
	// 			// service closed

	// 			// TODO: handle errors
	// 			_ = stateSub.Close()
	// 			_ = statusSub.Close()
	// 			_ = rb.Close()
	// 			return
	// 		case msg, ok := <-stateSub.Channel():
	// 			if !ok {
	// 				panic("StateSubscription channel closed")
	// 			}

	// 			s.sessionMapLock.RLock()
	// 			for _, id := range msg.Targets {
	// 				ch, ok := s.idToChan[id]
	// 				if !ok {
	// 					// TODO: log channel doesn't exist
	// 					continue
	// 				}

	// 				select {
	// 				case ch <- &pb.Response{
	// 					Message: &pb.Response_Player{
	// 						Player: &pb.Player{
	// 							Id:    id,
	// 							State: msg.State,
	// 						},
	// 					},
	// 				}:
	// 				default:
	// 					// TODO: log channel blocked
	// 				}
	// 			}
	// 			s.sessionMapLock.RUnlock()
	// 		case msg, ok := <-statusSub.Channel():
	// 			if !ok {
	// 				panic("StatusSubscription channel closed")
	// 			}

	// 			s.sessionMapLock.RLock()
	// 			for _, id := range msg.Targets {
	// 				ch, ok := s.idToChan[id]
	// 				if !ok {
	// 					// TODO: log channel doesn't exist
	// 					continue
	// 				}

	// 				select {
	// 				case ch <- &pb.Response{
	// 					Message: &pb.Response_StatusUpdate{
	// 						StatusUpdate: msg.Update,
	// 					},
	// 				}:
	// 				default:
	// 					// TODO: log channel blocked
	// 				}
	// 			}
	// 			s.sessionMapLock.RUnlock()
	// 		}
	// 	}
	// }()

	// return nil
}
