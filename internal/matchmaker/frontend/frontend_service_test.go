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
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/appmain/apptest"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/rpc"
	"github.com/GambitLLC/quip/internal/test"
	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

func TestConnect(t *testing.T) {
	cfg := viper.New()
	newService(t, cfg)

	client, _ := newClient(t, cfg)
	require.NotNil(t, client, "QuipFrontendClient is nil")

	ctx, cancel := context.WithCancel(test.NewContext(t))
	defer cancel()

	stream, err := client.Connect(ctx, &emptypb.Empty{})
	require.NoError(t, err, "client.Connect failed")

	err = stream.CloseSend()
	require.NoError(t, err, "stream.CloseSend failed")
}

func TestGetPlayer(t *testing.T) {
	runFrontendTest(t, func(ctx context.Context, t *testing.T, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate) {
		player, err := client.GetPlayer(ctx, &pb.GetPlayerRequest{})
		require.NoError(t, err, "GetPlayer failed")
		require.NotNil(t, player, "GetPlayer returned nil Player")
		require.Equal(t, id, player.Id, "Response should have been for the current player")
	})
}

func TestQueue(t *testing.T) {
	runFrontendTest(t, func(ctx context.Context, t *testing.T, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate) {
		// invalid argument: missing config
		_, err := client.StartQueue(ctx, &pb.StartQueueRequest{})
		require.NotNil(t, err, "StartQueue should require .Config")
		require.EqualValues(t, codes.InvalidArgument, status.Code(err), "Expected InvalidArgument status code")

		// invalid argument: missing gamemode
		_, err = client.StartQueue(ctx, &pb.StartQueueRequest{
			Config: &pb.QueueConfiguration{},
		})
		require.NotNil(t, err, "StartQueue should require .Config.Gamemode")
		require.EqualValues(t, codes.InvalidArgument, status.Code(err), "Expected InvalidArgument status code")

		// invalid argument: invalid gamemode
		_, err = client.StartQueue(ctx, &pb.StartQueueRequest{
			Config: &pb.QueueConfiguration{
				Gamemode: "some invalid gamemode",
			},
		})
		require.NotNil(t, err, "StartQueue should validate .Config.Gamemode")
		require.EqualValues(t, codes.InvalidArgument, status.Code(err), "Expected InvalidArgument status code")

		// start queue normally
		_, err = client.StartQueue(ctx, &pb.StartQueueRequest{
			Config: &pb.QueueConfiguration{
				Gamemode: "test_1x1",
			},
		})
		require.NoError(t, err, "StartQueue failed")

		update := requireUpdate(ctx, t, updates)
		require.NotNil(t, update.GetUpdate().GetQueueStarted(), "Update should be QueueStarted")

		// confirm player status is updated
		player, err := client.GetPlayer(ctx, &pb.GetPlayerRequest{})
		require.NoError(t, err, "GetPlayer failed")
		require.NotNil(t, player, "GetPlayer returned nil Player")
		require.Equal(t, id, player.Id, "Response should have been for the current player")
		queue := player.GetQueueAssignment()
		require.NotNil(t, queue, "Player should be in queue")

		_, err = client.StopQueue(ctx, &pb.StopQueueRequest{})
		require.NoError(t, err, "StopQueue failed")
		update = requireUpdate(ctx, t, updates)
		require.NotNil(t, update.GetUpdate().GetQueueStopped(), "Update should be QueueStopped")
	})
}

// TODO: this test fails occasionally -- figure out why
// func TestBrokerMessages(t *testing.T) {
// 	tt := []struct {
// 		name     string
// 		route    broker.Route
// 		msg      func(id string) proto.Message
// 		expected func(id string) *pb.Response
// 	}{
// 		{
// 			name:  "StateUpdate",
// 			route: broker.StateUpdateRoute,
// 			msg: func(id string) proto.Message {
// 				return &pb.StateUpdateMessage{
// 					Targets: []string{id},
// 					State:   pb.PlayerState_PLAYER_STATE_PLAYING,
// 				}
// 			},
// 			expected: func(id string) *pb.Response {
// 				return &pb.Response{
// 					Message: &pb.Response_Player{
// 						Player: &pb.Player{
// 							Id:    id,
// 							State: pb.PlayerState_PLAYER_STATE_PLAYING,
// 						},
// 					},
// 				}
// 			},
// 		},
// 		{
// 			name:  "StatusUpdate",
// 			route: broker.StatusUpdateRoute,
// 			msg: func(id string) proto.Message {
// 				return &pb.StatusUpdateMessage{
// 					Targets: []string{id},
// 					Update: &pb.StatusUpdate{
// 						Update: &pb.StatusUpdate_QueueStopped{
// 							QueueStopped: &pb.QueueStopped{
// 								Reason: pb.Reason_REASON_PLAYER,
// 							},
// 						},
// 					},
// 				}
// 			},
// 			expected: func(id string) *pb.Response {
// 				return &pb.Response{
// 					Message: &pb.Response_StatusUpdate{
// 						StatusUpdate: &pb.StatusUpdate{
// 							Update: &pb.StatusUpdate_QueueStopped{
// 								QueueStopped: &pb.QueueStopped{
// 									Reason: pb.Reason_REASON_PLAYER,
// 								},
// 							},
// 						},
// 					},
// 				}
// 			},
// 		},
// 	}

// 	for _, tc := range tt {
// 		t.Run(tc.name, func(t *testing.T) {
// 			cfg := viper.New()
// 			newService(t, cfg)

// 			rb := broker.NewRedisBroker(cfg)
// 			t.Cleanup(func() {
// 				require.NoError(t, rb.Close(), "RedisBroker.Close failed")
// 			})

// 			client, id := newClient(t, cfg)
// 			require.NotNil(t, client, "QuipFrontendClient is nil")

// 			ctx, cancel := context.WithCancel(test.NewContext(t))
// 			t.Cleanup(cancel)

// 			stream, err := client.Connect(ctx)
// 			require.NoError(t, err, "client.Connect failed")

// 			resps := make(chan *pb.Response, 1)

// 			eg := &errgroup.Group{}
// 			eg.Go(func() error {
// 				resp, err := stream.Recv()
// 				if err == io.EOF {
// 					return nil
// 				}

// 				if err != nil {
// 					return err
// 				}
// 				resps <- resp
// 				return nil
// 			})

// 			err = rb.Publish(ctx, tc.route, tc.msg(id))
// 			require.NoError(t, err, "RedisBroker.Publish failed")

// 			select {
// 			case resp := <-resps:
// 				expected := tc.expected(id)
// 				equal := proto.Equal(resp, expected)
// 				require.Truef(t, equal, "proto.Equal is false\nrecv'd: %+v\nexpected: %+v", resp, expected)
// 			case <-time.After(3 * time.Second):
// 				require.FailNow(t, "test timed out")
// 			}

// 			err = stream.CloseSend()
// 			require.NoError(t, err, "stream.CloseSend failed")

// 			err = eg.Wait()
// 			require.NoError(t, err, "eg.Wait returned error")
// 		})
// 	}

// }

type TestCase func(ctx context.Context, t *testing.T, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate)

func requireUpdate(ctx context.Context, t *testing.T, updates <-chan *pb.PlayerUpdate) *pb.PlayerUpdate {
	select {
	case update, ok := <-updates:
		if !ok {
			require.FailNow(t, "update channel closed")
		}

		require.NotNil(t, update, "received nil PlayerUpdate")
		return update
	case <-ctx.Done():
		require.FailNow(t, "test ended while waiting for response")
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

	stream, err := client.Connect(ctx, &emptypb.Empty{})
	require.NoError(t, err, "client.Connect failed")

	updates := make(chan *pb.PlayerUpdate, 1)
	errs := make(chan error, 1)
	eg := &errgroup.Group{}

	// Cleanup CloseSend and Wait incase subtests are run.
	t.Cleanup(func() {
		// err := stream.CloseSend()
		// require.NoError(t, err, "stream.CloseSend failed")
		cancel()

		err = eg.Wait()
		require.NoError(t, err, "eg.Wait returned error")
	})

	eg.Go(func() error {
		defer func() {
			close(updates)
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

			updates <- msg
		}
	})

	// Read the first update that connect sends
	<-updates

	done := make(chan struct{}, 1)
	eg.Go(func() error {
		defer close(done)
		tc(ctx, t, id, client, updates)
		return nil
	})

	select {
	case <-done:
		cancel()
	case err := <-errs:
		require.NoError(t, err)
	}
}

func newService(t *testing.T, cfg config.Mutable) {
	test.NewRedis(t, cfg)
	test.NewGamesFile(t, cfg, nil)
	test.NewOpenMatch(t, cfg)
	test.SetTLS(cfg)

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"matchmaker.frontend",
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
			svc := New(cfg)
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
	)
}

// newClient creates a new QuipFrontendClient with an arbitrary player id.
func newClient(t *testing.T, cfg config.View) (pb.QuipFrontendClient, string) {
	id := xid.New().String()
	conn, err := rpc.GRPCClientFromService(
		cfg,
		"matchmaker.frontend",
		grpc.WithStreamInterceptor(
			func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
				return streamer(metadata.AppendToOutgoingContext(ctx, "Player-Id", id), desc, cc, method, opts...)
			},
		),
		grpc.WithUnaryInterceptor(
			func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
				return invoker(metadata.AppendToOutgoingContext(ctx, "Player-Id", id), method, req, reply, cc, opts...)
			},
		),
	)
	require.NoError(t, err, "GRPCClientFromConfig failed")

	return pb.NewQuipFrontendClient(conn), id
}
