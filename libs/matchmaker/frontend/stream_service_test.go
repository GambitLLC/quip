package frontend

import (
	"context"
	"io"
	"log"
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
	cfg := newStreamService(t)

	client, _ := newClient(t, cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stream, err := client.Stream(ctx)
	require.NoError(t, err, "client.Stream failed")

	eg := errgroup.Group{}
	// sending
	eg.Go(func() error {
		msgs := []*pb.StreamRequest{
			{
				Message: &pb.StreamRequest_GetStatus{},
			},
			{
				Message: &pb.StreamRequest_StartQueue{
					StartQueue: &pb.StartQueueRequest{
						Config: &pb.GameConfiguration{
							Gamemode: "test",
						},
					},
				},
			},
			{
				Message: &pb.StreamRequest_StopQueue{},
			},
		}
		for _, msg := range msgs {
			if err := stream.Send(msg); err != nil {
				return err
			}
		}

		return nil
	})

	// receiving
	eg.Go(func() error {
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				log.Print("recv closed")
				return nil
			}

			if err != nil {
				return err
			}

			t.Logf("recv: %+v", msg)
		}
	})

	<-time.After(2 * time.Second)
	_ = stream.CloseSend()

	err = eg.Wait()
	t.Log(err)

}

func newStreamService(t *testing.T) config.View {
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

	pb.RegisterFrontendStreamServer(s, srv)

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

func newClient(t *testing.T, cfg config.View) (pb.FrontendStreamClient, string) {
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

	return pb.NewFrontendStreamClient(conn), id
}
