package backend

import (
	"context"

	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

type Service struct {
	store statestore.Service
}

func New(cfg config.View) *Service {
	return &Service{
		store: statestore.New(cfg),
	}
}

func (s *Service) UpdateMatch(ctx context.Context, req *pb.UpdateMatchRequest) (*emptypb.Empty, error) {
	err := s.store.UpdateMatchState(ctx, req.Id, ipb.MatchInternal_State(req.State))
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}
