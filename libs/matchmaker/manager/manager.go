package manager

import (
	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	panic("not yet implemented")

	// service := New(cfg)
	// b.AddHandler(func(s *grpc.Server) {
	// 	pb.RegisterQuipManagerServer(s, service)
	// })
	// b.AddCloser(service.store.Close)

	// return nil
}
