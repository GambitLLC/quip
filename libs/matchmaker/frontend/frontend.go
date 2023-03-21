package frontend

import (
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/pb"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterMatchmakerServer(s, service)
	})
	b.AddCloser(service.broker.Close)
	b.AddCloser(service.store.Close)

	return nil
}
