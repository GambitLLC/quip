package inmemory

import (
	"context"
	"fmt"
	"log"
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

func Run(ctx context.Context) (err error) {
	// create redis server in memory
	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		return err
	}
	defer func() {
		if err != nil {
			mredis.Close()
		}
	}()

	log.Printf("miniredis serving on: %s", mredis.Addr())

	// run minimatch processes
	if err := runMinimatch(ctx, mredis.Port()); err != nil {
		return err
	}

	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		return err
	}

	_, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		return err
	}

	cfg, err := createMemoryConfig(port, mredis.Port())
	if err != nil {
		return err
	}

	// run director
	go func(cfg config.View) {
		directorDaemon := director.New(cfg)
		if err := directorDaemon.Start(ctx); err != nil {
			panic(err)
		}
	}(cfg)

	// run matchmaker processes and // TODO: agones with mock gameservers
	service, err := appmain.NewGRPCService(serviceName, cfg, func(cfg config.View, b *appmain.GRPCBindings) error {
		if err := frontend.BindService(cfg, b); err != nil {
			return err
		}

		if err := backend.BindService(cfg, b); err != nil {
			return err
		}

		if err := matchfunction.BindService(cfg, b); err != nil {
			return err
		}

		return nil
	}, func(network, addr string) (net.Listener, error) {
		return ln, nil
	})
	if err != nil {
		return err
	}

	go func() {
		<-ctx.Done()
		mredis.Close()
		if err := service.Stop(); err != nil {
			panic(err)
		}
	}()

	return nil
}

func createMemoryConfig(serverPort, mredisPort string) (*viper.Viper, error) {
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
			cfg.Set(key, serverPort)
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

	cfg.Set(fmt.Sprintf("%s.hostname", serviceName), "")
	cfg.Set(fmt.Sprintf("%s.port", serviceName), serverPort)

	cfg.Set("matchmaker.redis.port", mredisPort)
	cfg.Set("broker.hostname", "localhost")
	cfg.Set("broker.port", mredisPort)

	return cfg, nil
}
