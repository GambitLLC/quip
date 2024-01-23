package sdk

import (
	"net"
	"testing"

	agonessdk "agones.dev/agones/pkg/sdk"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/appmain/apptest"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/matchmaker/manager"
)

func TestSDK(t *testing.T) {
	cfg := viper.New()
	newSDKServer(t, cfg)

	sdk, err := New(cfg, nil)
	require.NoError(t, err, "failed to make sdk")

	// TODO: actually test sdk
	_ = sdk
}

func newSDKServer(t *testing.T, cfg config.Mutable) {
	// spin up all services
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	t.Setenv("AGONES_SDK_GRPC_PORT", port)

	services := []string{
		apptest.ServiceName,
		"matchmaker.manager",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		manager.BindService,
		func(v config.View, g *appmain.GRPCBindings) error {
			g.AddHandler(func(s *grpc.Server) {
				agonessdk.RegisterSDKServer(s, &sdkServer{
					gs: make(chan *agonessdk.GameServer, 1),
				})
			})
			return nil
		},
	)
}

type sdkServer struct {
	agonessdk.UnimplementedSDKServer

	gs chan *agonessdk.GameServer
}
