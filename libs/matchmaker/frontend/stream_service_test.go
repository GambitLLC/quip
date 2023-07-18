package frontend

import (
	"context"
	"io"
	"net"
	"testing"
	"time"

	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type wrappedStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (s *wrappedStream) Context() context.Context {
	return s.ctx
}

func TestStream(t *testing.T) {
	s := grpc.NewServer(grpc.StreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		md, ok := metadata.FromIncomingContext(ss.Context())
		if !ok {
			return status.Error(codes.InvalidArgument, "missing metadata")
		}

		md.Set("Player-Id", "player-id")

		ctx := metadata.NewIncomingContext(ss.Context(), md)
		return handler(srv, &wrappedStream{ServerStream: ss, ctx: ctx})
	}))
	matchmaker.RegisterFrontendStreamServer(s, &StreamService{})

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	go func() {
		err := s.Serve(ln)
		require.NoError(t, err, "Serve failed")
	}()
	defer s.Stop()

	conn, err := grpc.Dial(ln.Addr().String(), grpc.WithTransportCredentials(
		insecure.NewCredentials(),
	))
	require.NoError(t, err, "grpc.Dial failed")

	client := matchmaker.NewFrontendStreamClient(conn)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stream, err := client.Stream(ctx)
	require.NoError(t, err, "client.Stream failed")

	eg := errgroup.Group{}
	// sending
	eg.Go(func() error {
		msgs := []*matchmaker.StreamRequest{
			{
				Message: &matchmaker.StreamRequest_GetStatus{},
			},
			{
				Message: &matchmaker.StreamRequest_StartQueue{},
			},
			{
				Message: &matchmaker.StreamRequest_StopQueue{},
			},
		}
		for _, msg := range msgs {
			if err := stream.Send(msg); err != nil {
				return err
			}
		}

		return stream.CloseSend()
	})

	// receiving
	eg.Go(func() error {
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				return nil
			}

			if err != nil {
				return err
			}

			t.Logf("recv: %+v", msg)
		}
	})

	err = eg.Wait()
	t.Log(err)
}
