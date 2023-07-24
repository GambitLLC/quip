package e2e_test

import (
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/oauth"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

func TestGetStatus(t *testing.T) {
	ctx := newContext(t)

	client, _ := newFrontendClient(t)
	stream, err := client.Stream(ctx)
	require.NoError(t, err, "client.Stream failed")

	err = stream.Send(&pb.StreamRequest{
		Message: &pb.StreamRequest_GetStatus{},
	})
	require.NoError(t, err, "GetStatus failed")

	resp, err := stream.Recv()
	require.NoError(t, err, "stream.Recv failed")

	switch msg := resp.Message.(type) {
	case *pb.StreamResponse_Error:
		require.Fail(t, "recv'd StreamResponse_Error", msg.Error)
	case *pb.StreamResponse_StatusUpdate:
		require.Equal(t, pb.State_STATE_IDLE, msg.StatusUpdate.State, "expected status idle")
	}
}

func newFrontendClient(t *testing.T) (pb.FrontendClient, string) {
	token, id := createDidToken(t)
	conn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend", grpc.WithPerRPCCredentials(
		oauth.TokenSource{
			TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
				AccessToken: token,
			}),
		},
	))
	require.NoError(t, err, "GRPCClientFromConfig failed")
	return pb.NewFrontendClient(conn), id
}
