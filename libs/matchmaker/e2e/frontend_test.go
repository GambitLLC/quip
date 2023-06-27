package e2e_test

import (
	"testing"

	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
	"github.com/stretchr/testify/require"
)

func TestConnection(t *testing.T) {
	ctx := newContext(t)

	client, err := newFrontendClient()
	require.NoError(t, err, "create frontend client failed")

	_, err = client.GetStatus(ctx, &matchmaker.GetStatusRequest{})
	require.NoError(t, err, "GetStatus failed")
}

func newFrontendClient() (matchmaker.FrontendClient, error) {
	conn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend")
	if err != nil {
		return nil, err
	}

	return matchmaker.NewFrontendClient(conn), nil
}
