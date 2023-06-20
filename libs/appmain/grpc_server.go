package appmain

import (
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/zerolog/log"
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/rpc"
)

// RunGRPCService runs the given GRPC service forever. For use in main functions.
func RunGRPCService(serviceName string, bind BindGRPC) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read()
	if err != nil {
		log.Panic().Str("component", serviceName).Err(err).Msg("Failed to read config")
	}

	s, err := NewGRPCService(serviceName, cfg, bind, net.Listen)
	if err != nil {
		log.Panic().Str("component", serviceName).Err(err).Msg("Failed to create grpc service")
	}

	<-c
	err = s.Stop()
	if err != nil {
		panic(err)
	}

	log.Info().Str("component", serviceName).Msg("Service stopped")
}

type BindGRPC func(config.View, *GRPCBindings) error

type GRPCBindings struct {
	s  *Service
	sp *rpc.ServerParams
}

func (b *GRPCBindings) AddHandler(h rpc.GRPCHandler) {
	b.sp.AddHandler(h)
}

func (b *GRPCBindings) AddCloser(closer func() error) {
	b.s.closers = append(b.s.closers, closer)
}

func (b *GRPCBindings) SetAuth(h grpc.UnaryServerInterceptor) {
	b.sp.SetAuth(h)
}

// NewGRPCService is used internally and only exposed for testing and development purposes.
// Use RunGRPCService instead.
func NewGRPCService(serviceName string, cfg config.View, bind BindGRPC, listen func(network, addr string) (net.Listener, error)) (*Service, error) {
	sp, err := rpc.NewServerParams(cfg, serviceName, listen)
	if err != nil {
		return nil, err
	}

	s := &Service{}

	bindings := &GRPCBindings{
		s:  s,
		sp: sp,
	}

	err = bind(cfg, bindings)
	if err != nil {
		_ = s.Stop() // ignore additional stop errors
		return nil, err
	}

	srv := rpc.Server{}
	err = srv.Start(sp)
	if err != nil {
		_ = s.Stop() // ignore additional stop errors
		return nil, err
	}
	bindings.AddCloser(srv.Stop)

	return s, nil
}
