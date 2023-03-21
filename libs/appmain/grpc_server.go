package appmain

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/rpc"
)

// RunGRPCService runs the given GRPC service forever. For use in main functions.
func RunGRPCService(serviceName string, bind BindGRPC) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read()
	if err != nil {
		panic(err)
	}

	s, err := newGRPCService(serviceName, cfg, bind)
	if err != nil {
		panic(err)
	}

	<-c
	err = s.stop()
	if err != nil {
		panic(err)
	}

	log.Print("Service stopped successfully")
}

type BindGRPC func(config.View, *GRPCBindings) error

type GRPCBindings struct {
	s  *service
	sp *rpc.ServerParams
}

func (b *GRPCBindings) AddHandler(h rpc.GRPCHandler) {
	b.sp.AddHandler(h)
}

func (b *GRPCBindings) AddCloser(closer func() error) {
	b.s.closers = append(b.s.closers, closer)
}

func newGRPCService(serviceName string, cfg config.View, bind BindGRPC) (*service, error) {
	sp, err := rpc.NewServerParams(cfg, serviceName)
	if err != nil {
		return nil, err
	}

	s := &service{}

	bindings := &GRPCBindings{
		s:  s,
		sp: sp,
	}

	err = bind(cfg, bindings)
	if err != nil {
		_ = s.stop() // ignore additional stop errors
		return nil, err
	}

	srv := rpc.Server{}
	err = srv.Start(sp)
	if err != nil {
		_ = s.stop() // ignore additional stop errors
		return nil, err
	}
	bindings.AddCloser(srv.Stop)

	return s, nil
}
