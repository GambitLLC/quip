package frontend

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"github.com/rs/zerolog"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.frontend").
	Logger()

type Service struct {
	// sessionMapLock sync.RWMutex

	// closed channel to prevent panics in tests
	closed chan struct{}
}

func NewQuipService(cfg config.View) *Service {
	srv := &Service{
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

// subscribeToMessages creates a new goroutine that will listen to StatusUpdate
// and QueueUpdate messages from the broker and send them to the relevant
// sessions that are connected.
func (s *Service) subscribeToMessages(cfg config.View) error {
	rb := broker.NewRedisBroker(cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	statusSub := rb.SubscribeStatusUpdate(ctx)
	if statusSub == nil {
		return errors.New("RedisBroker.SubscribeStatusUpdate returned nil")
	}

	queueSub := rb.SubscribeQueueUpdate(ctx)
	if queueSub == nil {
		return errors.New("RedisBroker.SubscribeQueueUpdate returned nil")
	}

	go func() {
		for {
			select {
			case <-s.closed:
				// service closed

				// TODO: handle errors
				_ = statusSub.Close()
				_ = queueSub.Close()
				_ = rb.Close()
				return
			case msg, ok := <-statusSub.Channel():
				if !ok {
					panic("StatusSubscription channel closed")
				}

				// TODO: send msg to relevant sessions
				_ = msg
			case msg, ok := <-queueSub.Channel():
				if !ok {
					panic("StatusSubscription channel closed")
				}

				// TODO: send msg to relevant sessions
				_ = msg
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

	// ch, err := s.subscribe(id)
	// if err != nil {
	// 	return nil, err
	// }

	return &session{
		srv: srv,
		out: make(chan *pb.Response, 1),
	}, nil
}

func (s *Service) deleteSession(sess *session) {
	//  s.sessionMapLock.RLock()
	//  defer s.sessionMapLock.RUnlock()
	// 	id, ok := s.chanToId[ch]

	// 	filter := s.idToChan[id][:0]
	// 	for _, other := range s.idToChan[id] {
	// 		if other != ch {
	// 			filter = append(filter, other)
	// 		}
	// 	}

	// // garbage collect
	//
	//	for i := len(filter); i < len(s.idToChan[id]); i++ {
	//		s.idToChan[id] = nil
	//	}
}
