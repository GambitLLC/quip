package e2e_test

import (
	"testing"

	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/oauth"
)

func TestGetStatus(t *testing.T) {
	ctx := newContext(t)

	client, id, err := newFrontendClient(t)
	require.NoError(t, err, "create frontend client failed")

	resp, err := client.GetStatus(ctx, &matchmaker.GetStatusRequest{
		Target: id,
	})
	require.NoError(t, err, "GetStatus failed")
	require.Equal(t, matchmaker.State_STATE_IDLE, resp.GetState(), "expected idle status")
}

func newFrontendClient(t *testing.T) (matchmaker.FrontendClient, string, error) {
	token, id := createDidToken(t)
	conn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend", grpc.WithPerRPCCredentials(
		oauth.TokenSource{
			TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
				AccessToken: token,
			}),
		},
	))
	if err != nil {
		return nil, "", err
	}

	return matchmaker.NewFrontendClient(conn), id, nil
}
