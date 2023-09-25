package frontend

import (
	"context"
	"io"
	"net"
	"testing"
	"time"

	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	rpcstatus "google.golang.org/genproto/googleapis/rpc/status"
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
	runFrontendTest(t, func(t *testing.T, id string, reqs chan<- *pb.Request, resps <-chan *pb.Response) {
		reqs <- &pb.Request{
			Action: &pb.Request_GetPlayer{},
		}

		resp := requireResponse(t, resps)
		player := resp.GetPlayer()
		require.NotNil(t, player, "Response should have returned Player")
		require.Equal(t, id, player.Id, "Response should have been for the current player")
	})
}

func TestQueue(t *testing.T) {
	runFrontendTest(t, func(t *testing.T, id string, reqs chan<- *pb.Request, resps <-chan *pb.Response) {
		// invalid argument: missing config
		reqs <- &pb.Request{
			Action: &pb.Request_StartQueue{},
		}

		err := requireError(t, resps)
		require.EqualValues(t, codes.InvalidArgument, err.Code, "Error code should have been InvalidArgument")

		// invalid argument: missing gamemode
		reqs <- &pb.Request{
			Action: &pb.Request_StartQueue{
				StartQueue: &pb.StartQueue{
					Config: &pb.QueueConfiguration{},
				},
			},
		}

		err = requireError(t, resps)
		require.EqualValues(t, codes.InvalidArgument, err.Code, "Error code should have been InvalidArgument")

		// invalid argument: invalid gamemode
		reqs <- &pb.Request{
			Action: &pb.Request_StartQueue{
				StartQueue: &pb.StartQueue{
					Config: &pb.QueueConfiguration{
						Gamemode: xid.New().String(),
					},
				},
			},
		}

		err = requireError(t, resps)
		require.EqualValues(t, codes.InvalidArgument, err.Code, "Error code should have been InvalidArgument")

		reqs <- &pb.Request{
			Action: &pb.Request_StartQueue{
				StartQueue: &pb.StartQueue{
					Config: &pb.QueueConfiguration{
						Gamemode: "test",
					},
				},
			},
		}

		resp := requireResponse(t, resps)
		status := resp.GetStatusUpdate()
		require.NotNil(t, status, "Response should have returned StatusUpdate")
		require.NotNil(t, status.GetQueueStarted(), "StatusUpdate should be QueueStarted")

		reqs <- &pb.Request{
			Action: &pb.Request_GetPlayer{},
		}

		resp = requireResponse(t, resps)
		player := resp.GetPlayer()
		require.NotNil(t, player, "Response should have returned Player")
		require.Equal(t, id, player.Id, "Response should have been for the current player")
		queue := player.GetQueueAssignment()
		require.NotNil(t, queue, "Player should be in queue")

		reqs <- &pb.Request{
			Action: &pb.Request_StopQueue{},
		}

		resp = requireResponse(t, resps)
		status = resp.GetStatusUpdate()
		require.NotNil(t, status, "Response should have returned StatusUpdate")
		require.NotNil(t, status.GetQueueStopped(), "StatusUpdate should be QueueStopped")
	})
}

// TODO: this test fails occasionally -- figure out why
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

type TestCase func(t *testing.T, id string, reqs chan<- *pb.Request, resps <-chan *pb.Response)

// requireResponse expects Response Message type to be anything that isn't Error
func requireResponse(t *testing.T, resps <-chan *pb.Response) *pb.Response {
	select {
	case resp, ok := <-resps:
		if !ok {
			require.FailNow(t, "response channel closed")
		}

		require.Nil(t, resp.GetError(), "received response error: %v", resp.GetError())
		return resp
	case <-time.After(3 * time.Second):
		require.FailNow(t, "test timed out waiting for response")
	}

	return nil
}

// requireError expects Response Message type to be of Error
func requireError(t *testing.T, resps <-chan *pb.Response) *rpcstatus.Status {
	select {
	case resp, ok := <-resps:
		if !ok {
			require.FailNow(t, "response channel closed")
		}

		err := resp.GetError()
		require.NotNil(t, err, "received non error message type %T: %v", resp.Message, resp.Message)

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

	done := make(chan struct{}, 1)
	eg.Go(func() error {
		defer close(done)
		tc(t, id, reqs, resps)
		return nil
	})

	select {
	case <-done:
	case err := <-errs:
		require.NoError(t, err)
	}
}

func newService(t *testing.T, cfg config.Mutable) {
	test.NewRedis(t, cfg)
	test.NewGamesFile(t, cfg)

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
	id := xid.New().String()
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
