package frontend

import (
	"context"
	"io"
	"net"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

func TestConnect(t *testing.T) {
	cfg := viper.New()
	newService(t, cfg)

	client, _ := newClient(t, cfg)
	require.NotNil(t, client, "QuipFrontendClient is nil")

	ctx, cancel := context.WithCancel(test.NewContext(t))
	defer cancel()

	stream, err := client.Connect(ctx)
	require.NoError(t, err, "client.Connect failed")

	err = stream.CloseSend()
	require.NoError(t, err, "stream.CloseSend failed")
}

func TestGetPlayer(t *testing.T) {
	runFrontendTest(t, func(t *testing.T, id string, reqs chan<- *pb.Request, resps <-chan *pb.Response, errs <-chan error) {
		reqs <- &pb.Request{
			Action: &pb.Request_GetPlayer{},
		}

		resp := requireResponse(t, resps, errs)
		t.Log(resp)
	})
}

func TestBrokerMessages(t *testing.T) {
	tt := []struct {
		name     string
		route    broker.Route
		msg      func(id string) proto.Message
		expected func(id string) *pb.Response
	}{
		{
			name:  "StateUpdate",
			route: broker.StateUpdateRoute,
			msg: func(id string) proto.Message {
				return &pb.StateUpdateMessage{
					Targets: []string{id},
					State:   pb.PlayerState_PLAYER_STATE_PLAYING,
				}
			},
			expected: func(id string) *pb.Response {
				return &pb.Response{
					Message: &pb.Response_Player{
						Player: &pb.Player{
							Id:    id,
							State: pb.PlayerState_PLAYER_STATE_PLAYING,
						},
					},
				}
			},
		},
		{
			name:  "StatusUpdate",
			route: broker.StatusUpdateRoute,
			msg: func(id string) proto.Message {
				return &pb.StatusUpdateMessage{
					Targets: []string{id},
					Update: &pb.StatusUpdate{
						Update: &pb.StatusUpdate_QueueStopped{
							QueueStopped: &pb.QueueStopped{
								Reason: pb.Reason_REASON_PLAYER,
							},
						},
					},
				}
			},
			expected: func(id string) *pb.Response {
				return &pb.Response{
					Message: &pb.Response_StatusUpdate{
						StatusUpdate: &pb.StatusUpdate{
							Update: &pb.StatusUpdate_QueueStopped{
								QueueStopped: &pb.QueueStopped{
									Reason: pb.Reason_REASON_PLAYER,
								},
							},
						},
					},
				}
			},
		},
	}

	for _, tc := range tt {
		t.Run(tc.name, func(t *testing.T) {
			cfg := viper.New()
			newService(t, cfg)

			rb := broker.NewRedisBroker(cfg)
			t.Cleanup(func() {
				require.NoError(t, rb.Close(), "RedisBroker.Close failed")
			})

			client, id := newClient(t, cfg)
			require.NotNil(t, client, "QuipFrontendClient is nil")

			ctx, cancel := context.WithCancel(test.NewContext(t))
			t.Cleanup(cancel)

			stream, err := client.Connect(ctx)
			require.NoError(t, err, "client.Connect failed")

			resps := make(chan *pb.Response, 1)

			eg := &errgroup.Group{}
			eg.Go(func() error {
				resp, err := stream.Recv()
				if err == io.EOF {
					return nil
				}

				if err != nil {
					return err
				}
				resps <- resp
				return nil
			})

			err = rb.Publish(ctx, tc.route, tc.msg(id))
			require.NoError(t, err, "RedisBroker.Publish failed")

			select {
			case resp := <-resps:
				expected := tc.expected(id)
				equal := proto.Equal(resp, expected)
				require.Truef(t, equal, "proto.Equal is false\nrecv'd: %+v\nexpected: %+v", resp, expected)
			case <-time.After(3 * time.Second):
				require.FailNow(t, "test timed out")
			}

			err = stream.CloseSend()
			require.NoError(t, err, "stream.CloseSend failed")

			err = eg.Wait()
			require.NoError(t, err, "eg.Wait returned error")
		})
	}

}

type TestCase func(t *testing.T, id string, reqs chan<- *pb.Request, resps <-chan *pb.Response, errs <-chan error)

func requireResponse(t *testing.T, resps <-chan *pb.Response, errs <-chan error) *pb.Response {
	select {
	case resp, ok := <-resps:
		if !ok {
			require.FailNow(t, "response channel closed")
		}
		return resp
	case err := <-errs:
		require.FailNowf(t, "received error while waiting for response", "err: %v", err)
	case <-time.After(3 * time.Second):
		require.FailNow(t, "test timed out waiting for response")
	}

	return nil
}

func requireError(t *testing.T, resps <-chan *pb.Response, errs <-chan error) error {
	select {
	case resp := <-resps:
		require.FailNowf(t, "received response while waiting for error", "resp: %v", resp)
	case err, ok := <-errs:
		if !ok {
			require.FailNow(t, "error channel closed")
		}
		return err
	case <-time.After(3 * time.Second):
		require.FailNow(t, "test timed out waiting for response")
	}

	return nil
}

func runFrontendTest(t *testing.T, tc TestCase) {
	cfg := viper.New()
	newService(t, cfg)

	client, id := newClient(t, cfg)
	require.NotNil(t, client, "QuipFrontendClient is nil")

	ctx, cancel := context.WithCancel(test.NewContext(t))

	// Cleanup cancel instead of defer incase subtests are run.
	t.Cleanup(cancel)

	stream, err := client.Connect(ctx)
	require.NoError(t, err, "client.Connect failed")

	reqs := make(chan *pb.Request, 1)
	resps := make(chan *pb.Response, 1)
	errs := make(chan error, 1)
	eg := &errgroup.Group{}

	// Cleanup CloseSend and Wait incase subtests are run.
	t.Cleanup(func() {
		err := stream.CloseSend()
		require.NoError(t, err, "stream.CloseSend failed")

		err = eg.Wait()
		require.NoError(t, err, "eg.Wait returned error")
	})

	eg.Go(func() error {
		defer func() {
			close(reqs)
			close(resps)
			close(errs)
		}()

		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				return nil
			}

			if err != nil {
				errs <- err
				return nil
			}

			resps <- msg
		}
	})
	eg.Go(func() error {
		for {
			req, ok := <-reqs
			if !ok {
				// request channel closed
				return nil
			}

			err := stream.Send(req)
			if err != nil {
				errs <- err
				return nil
			}
		}
	})

	tc(t, id, reqs, resps, errs)
}

func newService(t *testing.T, cfg config.Mutable) {
	test.NewRedis(t, cfg)

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"matchmaker.frontend",
		"openmatch.backend",
		"openmatch.frontend",
		"openmatch.query",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		func(cfg config.View, b *appmain.GRPCBindings) error {
			svc := NewQuipService(cfg)
			// TODO: replace some internals for testing

			b.AddHandler(func(s *grpc.Server) {
				pb.RegisterQuipFrontendServer(s, svc)
			})

			// for testing: use a basic stream interceptor that just makes sure clients have player-id set
			b.AddStreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
				if info.FullMethod != pb.QuipFrontend_Connect_FullMethodName {
					return handler(srv, ss)
				}

				md, ok := metadata.FromIncomingContext(ss.Context())
				if !ok {
					return status.Error(codes.InvalidArgument, "missing metadata")
				}

				if len(md.Get("Player-Id")) == 0 {
					return status.Error(codes.Unauthenticated, "missing Player-Id")
				}

				return handler(srv, ss)
			})

			b.AddCloser(svc.Close)

			return nil
		},
		test.BindOpenMatchService,
	)
}

// newClient creates a new QuipFrontendClient with an arbitrary player id.
func newClient(t *testing.T, cfg config.View) (pb.QuipFrontendClient, string) {
	id := uuid.NewString()
	conn, err := rpc.GRPCClientFromConfig(
		cfg,
		"matchmaker.frontend",
		grpc.WithStreamInterceptor(
			func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
				return streamer(metadata.AppendToOutgoingContext(ctx, "Player-Id", id), desc, cc, method, opts...)
			},
		),
	)
	require.NoError(t, err, "GRPCClientFromConfig failed")

	return pb.NewQuipFrontendClient(conn), id
}

// import (
// 	"context"
// 	"io"
// 	"net"
// 	"sync"
// 	"testing"
// 	"time"

// 	"github.com/google/uuid"
// 	"github.com/rs/xid"
// 	"github.com/spf13/viper"
// 	"github.com/stretchr/testify/require"
// 	"golang.org/x/sync/errgroup"
// 	"google.golang.org/grpc"
// 	"google.golang.org/grpc/codes"
// 	"google.golang.org/grpc/metadata"
// 	"google.golang.org/grpc/status"
// 	"google.golang.org/protobuf/types/known/emptypb"
// 	"google.golang.org/protobuf/types/known/timestamppb"
// 	ompb "open-match.dev/open-match/pkg/pb"

// 	"github.com/GambitLLC/quip/libs/config"
// 	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
// 	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
// 	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
// 	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
// 	"github.com/GambitLLC/quip/libs/rpc"
// )

// func TestStream(t *testing.T) {
// 	type StreamAction struct {
// 		request *pb.StreamRequest
// 		wantErr bool // if wantErr is false, any StreamResponse_Errors fail the test case
// 		wait    func(*pb.StreamResponse) bool
// 	}

// 	tests := []struct {
// 		name    string
// 		actions []StreamAction
// 	}{
// 		{
// 			name: "get status returns idle",
// 			actions: []StreamAction{
// 				{
// 					request: &pb.StreamRequest{
// 						Message: &pb.StreamRequest_GetStatus{},
// 					},
// 					wait: func(sr *pb.StreamResponse) bool {
// 						switch msg := sr.Message.(type) {
// 						case *pb.StreamResponse_StatusUpdate:
// 							return msg.StatusUpdate.State == pb.State_STATE_IDLE
// 						default:
// 							return false
// 						}
// 					},
// 				},
// 			},
// 		},
// 		{
// 			name: "start and stop queue get status updates",
// 			actions: []StreamAction{
// 				{
// 					request: &pb.StreamRequest{
// 						Message: &pb.StreamRequest_StartQueue{
// 							StartQueue: &pb.StartQueueRequest{
// 								Config: &pb.GameConfiguration{
// 									Gamemode: "test",
// 								},
// 							},
// 						},
// 					},
// 					wait: func(sr *pb.StreamResponse) bool {
// 						switch msg := sr.Message.(type) {
// 						case *pb.StreamResponse_StatusUpdate:
// 							return msg.StatusUpdate.State == pb.State_STATE_SEARCHING
// 						default:
// 							return false
// 						}
// 					},
// 				},
// 				{
// 					request: &pb.StreamRequest{
// 						Message: &pb.StreamRequest_StopQueue{},
// 					},
// 					wait: func(sr *pb.StreamResponse) bool {
// 						switch msg := sr.Message.(type) {
// 						case *pb.StreamResponse_StatusUpdate:
// 							return msg.StatusUpdate.State == pb.State_STATE_IDLE
// 						default:
// 							return false
// 						}
// 					},
// 				},
// 			},
// 		},
// 		{
// 			name: "starting queue twice errors",
// 			actions: []StreamAction{
// 				{
// 					request: &pb.StreamRequest{
// 						Message: &pb.StreamRequest_StartQueue{
// 							StartQueue: &pb.StartQueueRequest{
// 								Config: &pb.GameConfiguration{
// 									Gamemode: "test",
// 								},
// 							},
// 						},
// 					},
// 				},
// 				{
// 					request: &pb.StreamRequest{
// 						Message: &pb.StreamRequest_StartQueue{
// 							StartQueue: &pb.StartQueueRequest{
// 								Config: &pb.GameConfiguration{
// 									Gamemode: "test",
// 								},
// 							},
// 						},
// 					},
// 					wantErr: true,
// 				},
// 			},
// 		},
// 	}

// 	for _, tc := range tests {
// 		tc := tc // capture range variable
// 		t.Run(tc.name, func(t *testing.T) {
// 			cfg := newService(t)
// 			newOMFrontend(t, cfg)

// 			client, _ := newClient(t, cfg)

// 			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
// 			defer cancel()

// 			stream, err := client.Stream(ctx)
// 			require.NoError(t, err, "client.Stream failed")

// 			msgs := make(chan *pb.StreamResponse, 1)

// 			eg := &errgroup.Group{}
// 			eg.Go(func() error {
// 				for {
// 					msg, err := stream.Recv()
// 					if err == io.EOF {
// 						return nil
// 					}

// 					if err != nil {
// 						return err
// 					}

// 					msgs <- msg
// 				}
// 			})

// 			for _, action := range tc.actions {
// 				if action.request != nil {
// 					err := stream.Send(action.request)
// 					require.NoError(t, err, "stream.Send failed")
// 				}

// 				if action.wantErr || action.wait != nil {
// 					found := false
// 					for !found {
// 						select {
// 						case <-ctx.Done():
// 							require.Fail(t, "test timed out")
// 						case <-stream.Context().Done():
// 							require.Fail(t, "stream closed")
// 						case msg := <-msgs:
// 							if action.wantErr {
// 								found = msg.GetError() != nil
// 								break
// 							}

// 							if err := msg.GetError(); err != nil {
// 								require.Fail(t, "got StreamResponse_Error", err)
// 							}

// 							found = action.wait(msg)

// 						}
// 					}

// 				}
// 			}

// 			err = stream.CloseSend()
// 			require.NoError(t, err, "stream.CloseSend failed")

// 			err = eg.Wait()
// 			require.NoError(t, err, "eg.Wait returned error")
// 		})
// 	}
// }

// func newService(t *testing.T) config.Mutable {
// 	cfg := viper.New()
// 	_ = statestoreTesting.NewService(t, cfg)
// 	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
// 	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

// 	s := grpc.NewServer(grpc.StreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
// 		md, ok := metadata.FromIncomingContext(ss.Context())
// 		if !ok {
// 			return status.Error(codes.InvalidArgument, "missing metadata")
// 		}

// 		if len(md.Get("Player-Id")) == 0 {
// 			return status.Error(codes.Unauthenticated, "missing player-id")
// 		}

// 		return handler(srv, ss)
// 	}))

// 	srv := NewService(cfg)

// 	// override game cache for testing
// 	srv.gc = &games.GameDetailCache{
// 		Cacher: config.NewViewCacher(cfg, func(cfg config.View) (interface{}, func(), error) {
// 			return map[string]*ipb.ProfileDetails{
// 				"test": {
// 					Players: 1,
// 					Teams:   1,
// 				},
// 			}, nil, nil
// 		}),
// 	}

// 	pb.RegisterFrontendServer(s, srv)

// 	ln, err := net.Listen("tcp", ":0")
// 	require.NoError(t, err, "net.Listen failed")

// 	_, port, err := net.SplitHostPort(ln.Addr().String())
// 	require.NoError(t, err, "net.SplitHostPort failed")

// 	cfg.Set("matchmaker.frontend.hostname", "localhost")
// 	cfg.Set("matchmaker.frontend.port", port)

// 	go func() {
// 		err := s.Serve(ln)
// 		require.NoError(t, err, "Serve failed")
// 	}()
// 	t.Cleanup(s.Stop)

// 	return cfg
// }

// func newClient(t *testing.T, cfg config.View) (pb.FrontendClient, string) {
// 	id := uuid.NewString()
// 	conn, err := rpc.GRPCClientFromConfig(
// 		cfg,
// 		"matchmaker.frontend",
// 		grpc.WithStreamInterceptor(
// 			func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
// 				return streamer(metadata.AppendToOutgoingContext(ctx, "Player-Id", id), desc, cc, method, opts...)
// 			},
// 		),
// 	)
// 	require.NoError(t, err, "GRPCClientFromConfig failed")

// 	return pb.NewFrontendClient(conn), id
// }

// func newOMFrontend(t *testing.T, cfg config.Mutable) {
// 	ln, err := net.Listen("tcp", ":0")
// 	require.NoError(t, err, "net.Listen failed")

// 	_, port, err := net.SplitHostPort(ln.Addr().String())
// 	require.NoError(t, err, "net.SplitHostPort failed")

// 	cfg.Set("openmatch.frontend.hostname", "localhost")
// 	cfg.Set("openmatch.frontend.port", port)

// 	s := grpc.NewServer()
// 	ompb.RegisterFrontendServiceServer(s, &stubOMFrontendService{})

// 	go func() {
// 		err := s.Serve(ln)
// 		if err != nil {
// 			t.Log(err)
// 		}
// 	}()

// 	t.Cleanup(s.Stop)
// }

// type stubOMFrontendService struct {
// 	ompb.UnimplementedFrontendServiceServer

// 	ts sync.Map // map of ticket id to pb.Ticket
// }

// func (s *stubOMFrontendService) CreateTicket(ctx context.Context, req *ompb.CreateTicketRequest) (*ompb.Ticket, error) {
// 	// Perform input validation.
// 	if req.Ticket == nil {
// 		return nil, status.Errorf(codes.InvalidArgument, ".ticket is required")
// 	}
// 	if req.Ticket.Assignment != nil {
// 		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with an assignment")
// 	}
// 	if req.Ticket.CreateTime != nil {
// 		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with create time set")
// 	}

// 	if req.Ticket.Id == "" {
// 		req.Ticket.Id = xid.New().String()
// 	}
// 	req.Ticket.CreateTime = timestamppb.Now()
// 	s.ts.Store(req.Ticket.Id, req.Ticket)
// 	return req.Ticket, nil
// }

// func (s *stubOMFrontendService) DeleteTicket(ctx context.Context, req *ompb.DeleteTicketRequest) (*emptypb.Empty, error) {
// 	_, ok := s.ts.LoadAndDelete(req.TicketId)
// 	if !ok {
// 		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
// 	}

// 	return &emptypb.Empty{}, nil
// }

// func (s *stubOMFrontendService) GetTicket(ctx context.Context, req *ompb.GetTicketRequest) (*ompb.Ticket, error) {
// 	item, ok := s.ts.Load(req.TicketId)
// 	if !ok {
// 		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
// 	}

// 	ticket, ok := item.(*ompb.Ticket)
// 	if !ok || ticket == nil {
// 		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
// 	}

// 	return ticket, nil
// }
