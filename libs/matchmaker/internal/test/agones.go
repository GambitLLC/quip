package test

import (
	"context"

	pb "agones.dev/agones/pkg/allocation/go"
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
)

func BindAgonesService(cfg config.View, b *appmain.GRPCBindings) error {
	svc := &agonesService{
		cfg: cfg,
	}
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterAllocationServiceServer(s, svc)
	})

	return nil
}

type agonesService struct {
	pb.UnimplementedAllocationServiceServer

	cfg config.View
}

func (s *agonesService) Allocate(ctx context.Context, req *pb.AllocationRequest) (*pb.AllocationResponse, error) {
	panic("not implemented")
}
