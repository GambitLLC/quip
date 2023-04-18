package backend

import (
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterBackendServer(s, service)
	})
	b.AddCloser(service.store.Close)

	return nil
}
