package manager

import (
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		matchmaker.RegisterQuipManagerServer(s, service)
	})
	b.AddCloser(service.Close)

	return nil
}
