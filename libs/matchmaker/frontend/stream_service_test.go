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

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

func TestStream(t *testing.T) {
	type StreamAction struct {
		request *pb.StreamRequest
		wantErr bool // if wantErr is false, any StreamResponse_Errors fail the test case
		wait    func(*pb.StreamResponse) bool
	}

	tests := []struct {
		name    string
		actions []StreamAction
	}{
		{
			name: "get status returns idle",
			actions: []StreamAction{
				{
					request: &pb.StreamRequest{
						Message: &pb.StreamRequest_GetStatus{},
					},
					wait: func(sr *pb.StreamResponse) bool {
						switch msg := sr.Message.(type) {
						case *pb.StreamResponse_StatusUpdate:
							return msg.StatusUpdate.State == pb.State_STATE_IDLE
						default:
							return false
						}
					},
				},
			},
		},
		{
			name: "start and stop queue get status updates",
			actions: []StreamAction{
				{
					request: &pb.StreamRequest{
						Message: &pb.StreamRequest_StartQueue{
							StartQueue: &pb.StartQueueRequest{
								Config: &pb.GameConfiguration{
									Gamemode: "test",
								},
							},
						},
					},
					wait: func(sr *pb.StreamResponse) bool {
						switch msg := sr.Message.(type) {
						case *pb.StreamResponse_StatusUpdate:
							return msg.StatusUpdate.State == pb.State_STATE_SEARCHING
						default:
							return false
						}
					},
				},
				{
					request: &pb.StreamRequest{
						Message: &pb.StreamRequest_StopQueue{},
					},
					wait: func(sr *pb.StreamResponse) bool {
						switch msg := sr.Message.(type) {
						case *pb.StreamResponse_StatusUpdate:
							return msg.StatusUpdate.State == pb.State_STATE_IDLE
						default:
							return false
						}
					},
				},
			},
		},
		{
			name: "starting queue twice errors",
			actions: []StreamAction{
				{
					request: &pb.StreamRequest{
						Message: &pb.StreamRequest_StartQueue{
							StartQueue: &pb.StartQueueRequest{
								Config: &pb.GameConfiguration{
									Gamemode: "test",
								},
							},
						},
					},
				},
				{
					request: &pb.StreamRequest{
						Message: &pb.StreamRequest_StartQueue{
							StartQueue: &pb.StartQueueRequest{
								Config: &pb.GameConfiguration{
									Gamemode: "test",
								},
							},
						},
					},
					wantErr: true,
				},
			},
		},
	}

	for _, tc := range tests {
		tc := tc // capture range variable
		t.Run(tc.name, func(t *testing.T) {
			cfg := newStreamService(t)
			newOMFrontend(t, cfg)

			client, _ := newClient(t, cfg)

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			stream, err := client.Stream(ctx)
			require.NoError(t, err, "client.Stream failed")

			msgs := make(chan *pb.StreamResponse, 1)

			eg := &errgroup.Group{}
			eg.Go(func() error {
				for {
					msg, err := stream.Recv()
					if err == io.EOF {
						return nil
					}

					if err != nil {
						return err
					}

					msgs <- msg
				}
			})

			for _, action := range tc.actions {
				if action.request != nil {
					err := stream.Send(action.request)
					require.NoError(t, err, "stream.Send failed")
				}

				if action.wantErr || action.wait != nil {
					found := false
					for !found {
						select {
						case <-ctx.Done():
							require.Fail(t, "test timed out")
						case <-stream.Context().Done():
							require.Fail(t, "stream closed")
						case msg := <-msgs:
							if action.wantErr {
								found = msg.GetError() != nil
								break
							}

							if err := msg.GetError(); err != nil {
								require.Fail(t, "got StreamResponse_Error", err)
							}

							found = action.wait(msg)

						}
					}

				}
			}

			err = stream.CloseSend()
			require.NoError(t, err, "stream.CloseSend failed")

			err = eg.Wait()
			require.NoError(t, err, "eg.Wait returned error")
		})
	}
}

func newStreamService(t *testing.T) config.Mutable {
	cfg := viper.New()
	_ = statestoreTesting.NewService(t, cfg)
	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

	s := grpc.NewServer(grpc.StreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		md, ok := metadata.FromIncomingContext(ss.Context())
		if !ok {
			return status.Error(codes.InvalidArgument, "missing metadata")
		}

		if len(md.Get("Player-Id")) == 0 {
			return status.Error(codes.Unauthenticated, "missing player-id")
		}

		return handler(srv, ss)
	}))

	srv := NewStreamService(cfg)

	// override game cache for testing
	srv.gc = &games.GameDetailCache{
		Cacher: config.NewViewCacher(cfg, func(cfg config.View) (interface{}, func(), error) {
			return map[string]*ipb.GameDetails{
				"test": {
					Players: 1,
					Teams:   1,
				},
			}, nil, nil
		}),
	}

	pb.RegisterFrontendServer(s, srv)

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	cfg.Set("matchmaker.frontend.hostname", "localhost")
	cfg.Set("matchmaker.frontend.port", port)

	go func() {
		err := s.Serve(ln)
		require.NoError(t, err, "Serve failed")
	}()
	t.Cleanup(s.Stop)

	return cfg
}

func newClient(t *testing.T, cfg config.View) (pb.FrontendClient, string) {
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

	return pb.NewFrontendClient(conn), id
}
