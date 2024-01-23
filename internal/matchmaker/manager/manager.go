package manager

import (
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterQuipManagerServer(s, service)
	})
	b.AddCloser(service.Close)

	return nil
}
