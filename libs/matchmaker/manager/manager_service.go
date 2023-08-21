package manager

import (
	"context"

	"google.golang.org/protobuf/types/known/emptypb"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type Service struct {
}

func (s *Service) CreateMatch(_ context.Context, _ *pb.CreateMatchRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}

func (s *Service) GetMatch(_ context.Context, _ *pb.GetMatchRequest) (*pb.GetMatchResponse, error) {
	panic("not implemented") // TODO: Implement
}

func (s *Service) SetMatchResults(_ context.Context, _ *pb.SetMatchResultsRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}
