package e2e_test

import (
	"context"
	"io"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/oauth"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

// TestCompleteMatch makes sure a new client can queue, find a match, and then finish it.
func TestCompleteMatch(t *testing.T) {
	cfg := start(t)
	ctx, cancel := context.WithTimeout(newContext(t), 30*time.Second)
	t.Cleanup(cancel)

	client, _ := newFrontendClient(t, cfg)
	stream, err := client.Stream(ctx)
	require.NoError(t, err, "client.Stream failed")
	t.Cleanup(func() { _ = stream.CloseSend() })

	resps, err := recvStream(t, ctx, stream)
	require.NoError(t, err, "recvStream failed")

	{
		// send start queue request
		err = stream.Send(&pb.StreamRequest{
			Message: &pb.StreamRequest_StartQueue{
				StartQueue: &pb.StartQueueRequest{
					Config: &pb.GameConfiguration{
						Gamemode: "test",
					},
				},
			},
		})
		require.NoError(t, err, "StartQueue failed")

	}

	{
		// expect status searching
		select {
		case <-ctx.Done():
			require.Fail(t, "test timed out")
		case resp := <-resps:
			switch msg := resp.Message.(type) {
			case *pb.StreamResponse_Error:
				require.Fail(t, "recv'd StreamResponse_Error", msg.Error)
			case *pb.StreamResponse_StatusUpdate:
				require.Equal(t, pb.State_STATE_SEARCHING, msg.StatusUpdate.State, "expected state searching")
			}
		}
	}

	{
		// wait for match found response
		select {
		case <-ctx.Done():
			require.Fail(t, "test timed out")
		case resp := <-resps:
			switch msg := resp.Message.(type) {
			case *pb.StreamResponse_Error:
				require.Fail(t, "recv'd StreamResponse_Error", msg.Error)
			case *pb.StreamResponse_StatusUpdate:
				require.Equal(t, pb.State_STATE_PLAYING, msg.StatusUpdate.State, "expected state playing")
			}
		}
	}

	require.Fail(t, "not yet implemented")
}

func newFrontendClient(t *testing.T, cfg config.View) (pb.FrontendClient, string) {
	token, id := createDidToken(t)
	conn, err := rpc.GRPCClientFromConfig(
		cfg,
		"matchmaker.frontend",
		grpc.WithPerRPCCredentials(
			oauth.TokenSource{
				TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
					AccessToken: token,
				}),
			},
		),
	)
	require.NoError(t, err, "GRPCClientFromConfig failed")
	return pb.NewFrontendClient(conn), id
}

func recvStream(t *testing.T, ctx context.Context, stream pb.Frontend_StreamClient) (<-chan *pb.StreamResponse, error) {
	resps := make(chan *pb.StreamResponse, 1)
	go func() {
		for {
			msg, err := stream.Recv()
			if err == io.EOF || status.Code(err) == codes.DeadlineExceeded {
				return
			}

			if err != nil {
				t.Error(err)
			}

			resps <- msg
		}
	}()

	return resps, nil
}
