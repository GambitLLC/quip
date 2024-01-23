package main

import (
	"net"
	"os"
	"os/signal"
	"syscall"
	"testing"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	"github.com/GambitLLC/quip/libs/matchmaker/manager"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	"github.com/GambitLLC/quip/libs/test"
)

func main() {
	testing.Init()

	// Uncomment below for verbose test logging
	// flag.Set("test.v", "true")

	testing.Main(nil, []testing.InternalTest{
		{
			Name: "demo",
			F: func(t *testing.T) {
				c := make(chan os.Signal, 1)
				signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

				cfg := viper.New()

				test.SetTLS(cfg)
				test.NewRedis(t, cfg)
				test.NewGamesFile(t, cfg, nil)
				test.NewOpenMatch(t, cfg)

				// spin up server for the rest of the services
				ln, err := net.Listen("tcp", ":0")
				require.NoError(t, err, "net.Listen failed")

				_, port, err := net.SplitHostPort(ln.Addr().String())
				require.NoError(t, err, "net.SplitHostPort failed")

				services := []string{
					apptest.ServiceName,
					"matchmaker.frontend",
					"matchmaker.manager",
					"matchmaker.matchfunction",
					"agones",
				}
				for _, svc := range services {
					cfg.Set(svc+".hostname", "localhost")
					cfg.Set(svc+".port", port)
				}

				agonesAllocSvc := test.NewAgonesAllocationService(t, cfg)

				apptest.TestGRPCService(
					t,
					cfg,
					[]net.Listener{ln},
					frontend.BindService,
					manager.BindService,
					matchfunction.BindService,
					agonesAllocSvc.Bind,
				)

				// start up director as well
				apptest.TestDaemon(t, cfg, director.New)

				<-c
			},
		},
	}, nil, nil)
}
