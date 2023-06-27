package inmemory

import (
	"context"
	"net"
	"strings"

	"github.com/alicebob/miniredis/v2"
	"github.com/spf13/viper"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/backend"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	"github.com/GambitLLC/quip/libs/test/data"
)

const (
	serviceName = "memory-matchmaker"
	configName  = "inmemory"
)

func Run(ctx context.Context) (cfg *viper.Viper, err error) {
	// create redis server in memory
	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			mredis.Close()
		}
	}()

	// run minimatch processes
	if err := runMinimatch(ctx, mredis.Port()); err != nil {
		return nil, err
	}

	matchmakerLn, err := net.Listen("tcp", ":0")
	if err != nil {
		return nil, err
	}

	_, matchmakerPort, err := net.SplitHostPort(matchmakerLn.Addr().String())
	if err != nil {
		return nil, err
	}

	frontendLn, err := net.Listen("tcp", ":0")
	if err != nil {
		return nil, err
	}

	_, frontendPort, err := net.SplitHostPort(frontendLn.Addr().String())
	if err != nil {
		return nil, err
	}

	cfg, err = createMemoryConfig(matchmakerPort, frontendPort, mredis.Port())
	if err != nil {
		return nil, err
	}

	// run director
	go func(cfg config.View) {
		directorDaemon := director.New(cfg)
		if err := directorDaemon.Start(ctx); err != nil {
			panic(err)
		}
	}(cfg)

	// frontendService is created separately because of unary interceptors
	frontendService, err := appmain.NewGRPCService(serviceName, cfg, frontend.BindService, func(network, addr string) (net.Listener, error) {
		return frontendLn, nil
	})
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			if err := frontendService.Stop(); err != nil {
				panic(err)
			}
		}
	}()

	// run other matchmaker processes and // TODO: agones with mock gameservers
	matchmakerServices, err := appmain.NewGRPCService(serviceName, cfg, func(cfg config.View, b *appmain.GRPCBindings) error {
		if err := backend.BindService(cfg, b); err != nil {
			return err
		}

		if err := matchfunction.BindService(cfg, b); err != nil {
			return err
		}

		return nil
	}, func(network, addr string) (net.Listener, error) {
		return matchmakerLn, nil
	})
	if err != nil {
		return nil, err
	}

	go func() {
		<-ctx.Done()
		mredis.Close()
		if err := frontendService.Stop(); err != nil {
			panic(err)
		}
		if err := matchmakerServices.Stop(); err != nil {
			panic(err)
		}
	}()

	return cfg, nil
}

func createMemoryConfig(matchmakerPort, frontendPort, mredisPort string) (*viper.Viper, error) {
	dcfg, err := config.ReadFile("default")
	if err != nil {
		return nil, err
	}

	cfg := viper.New()
	for _, key := range dcfg.AllKeys() {
		// Configure all hosts to be localhost
		if strings.HasSuffix(key, "hostname") {
			cfg.Set(key, "localhost")
			continue
		}

		// all matchmaker services should be on the provided server port
		if strings.HasPrefix(key, "matchmaker") && strings.HasSuffix(key, "port") {
			cfg.Set(key, matchmakerPort)
			continue
		}

		// all openmatch services should be on minimatch port
		if strings.HasPrefix(key, "openmatch") && strings.HasSuffix(key, "port") {
			cfg.Set(key, 50499)
			continue
		}
	}

	// set tls
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKeyFile", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

	// frontend requires a separate port because of unary server interceptor
	cfg.Set("matchmaker.frontend.port", frontendPort)

	cfg.Set("matchmaker.redis.port", mredisPort)
	cfg.Set("broker.hostname", "localhost")
	cfg.Set("broker.port", mredisPort)

	return cfg, nil
}
