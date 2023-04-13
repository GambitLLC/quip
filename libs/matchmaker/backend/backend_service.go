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

func (s *Service) CreateMatch(_ context.Context, _ *pb.CreateMatchRequest) (*pb.CreateMatchResponse, error) {
	panic("not implemented") // TODO: Implement
	// CreateMatch should allocate a match from Agones and start tracking the gameservers (health checks)
}

func (s *Service) UpdateMatchState(ctx context.Context, req *pb.UpdateMatchStateRequest) (*emptypb.Empty, error) {
	err := s.store.UpdateMatchState(ctx, req.Id, ipb.MatchInternal_State(req.State))
	if err != nil {
		return nil, err
	}

	// TODO: handle match finishing
	// if req.State == pb.MatchState_MATCH_STATE_FINISHED {
	// }

	return &emptypb.Empty{}, nil
}
