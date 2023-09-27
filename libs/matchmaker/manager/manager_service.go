package manager

import (
	"context"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"

	"google.golang.org/protobuf/types/known/emptypb"
)

type Service struct {
}

// CreateMatch should be called by gameservers when they are allocated. It will attempt
// to mark all players in the roster as participants in the match.
func (s *Service) CreateMatch(_ context.Context, _ *pb.CreateMatchRequest) (*pb.CreateMatchResponse, error) {
	panic("not implemented") // TODO: Implement
}

// StartMatch should be called when gameservers actually begin play.
// For matches with a wager, this means after collecting the wager from all players.
func (s *Service) StartMatch(_ context.Context, _ *pb.StartMatchRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}

// CancelMatch should be called if gameservers do not start play for any reason.
func (s *Service) CancelMatch(_ context.Context, _ *pb.CancelMatchRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}

// FinishMatch should be called when gameservers finish play.
func (s *Service) FinishMatch(_ context.Context, _ *pb.FinishMatchRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}

