package inmemory

import (
	"context"
	"net"
	"strings"

	"github.com/alicebob/miniredis/v2"
	"github.com/spf13/viper"
	"golang.org/x/sync/errgroup"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/backend"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	"github.com/GambitLLC/quip/libs/test/data"
)

const (
	serviceName = "memory-matchmaker"
	configName  = "inmemory"
)

// Run will run matchmaker services, open match, and agones in memory until
// ctx is cancelled.
func Run(ctx context.Context) error {
	proc, err := Start(viper.New())
	if err != nil {
		return err
	}

	go func() {
		<-ctx.Done()
		proc.Kill()
	}()

	return proc.Wait()
}

type Process struct {
	eg     *errgroup.Group
	cancel func()
}

func (p *Process) Wait() error {
	return p.eg.Wait()
}

func (p *Process) Kill() {
	p.cancel()
}

// Start will spin up matchmaker services, open match, and agones in memory.
// Will modify cfg to have appropriate values for the services in memory.
func Start(cfg config.Mutable) (proc *Process, err error) {
	ctx, cancel := context.WithCancel(context.Background())
	eg, ctx := errgroup.WithContext(ctx)
	proc = &Process{
		eg:     eg,
		cancel: cancel,
	}
	defer func() {
		if err != nil {
			cancel()
		}
	}()

	redisPort, err := startRedis(ctx)
	if err != nil {
		return
	}

	// get frontend listener separately because of unary interceptor
	frontendLn, frontendPort, err := listen()
	if err != nil {
		return
	}

	matchmakerLn, matchmakerPort, err := listen()
	if err != nil {
		return
	}

	if err = modifyCfg(cfg, matchmakerPort, frontendPort, redisPort); err != nil {
		return
	}

	// run openmatch services
	proc.eg.Go(func() error {
		return runMinimatch(ctx, redisPort)
	})

	// run matchmaker frontend service separately because of unary interceptor
	proc.eg.Go(func() error {
		return runService(ctx, "matchmaker.frontend", cfg, frontend.BindService, frontendLn)
	})

	// run all other matchmaker services
	proc.eg.Go(func() error {
		return runService(ctx, serviceName, cfg, func(cfg config.View, b *appmain.GRPCBindings) error {
			if err := backend.BindService(cfg, b); err != nil {
				return err
			}

			if err := matchfunction.BindService(cfg, b); err != nil {
				return err
			}

			return nil
		}, matchmakerLn)
	})

	return
}

// startRedis starts miniredis and returns the port redis is listening on.
// Will close redis when ctx is done.
func startRedis(ctx context.Context) (string, error) {
	// create redis server in memory
	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		return "", err
	}

	go func() {
		<-ctx.Done()
		mredis.Close()
	}()

	return mredis.Port(), nil
}

// listen returns a listener on an open port.
func listen() (net.Listener, string, error) {
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		return nil, "", err
	}

	_, port, err := net.SplitHostPort(ln.Addr().String())
	return ln, port, err
}

func modifyCfg(cfg config.Mutable, matchmakerPort, frontendPort, redisPort string) error {
	dcfg, err := config.ReadFile("default")
	if err != nil {
		return err
	}

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

	cfg.Set("matchmaker.redis.port", redisPort)
	cfg.Set("broker.hostname", "localhost")
	cfg.Set("broker.port", redisPort)

	return nil
}

func runService(ctx context.Context, name string, cfg config.View, bind appmain.BindGRPC, ln net.Listener) error {
	svc, err := appmain.NewGRPCService(name, cfg, bind, func(network, addr string) (net.Listener, error) {
		return ln, nil
	})
	if err != nil {
		return err
	}

	<-ctx.Done()
	return svc.Stop()
}
