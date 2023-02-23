package matchmaker

import (
	"context"

	"github.com/GambitLLC/quip/packages/api/pkg/pb"
	"google.golang.org/protobuf/types/known/emptypb"
)

type Service struct {
}

// GetStatus returns the current matchmaking status.
func (s *Service) GetStatus(_ context.Context, _ *emptypb.Empty) (*pb.StatusResponse, error) {
	panic("not implemented") // TODO: Implement
}

// StartQueue starts searching for a match with the given parameters.
func (s *Service) StartQueue(_ context.Context, _ *pb.StartQueueRequest) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}

// StopQueue stops searching for a match. Idempotent.
func (s *Service) StopQueue(_ context.Context, _ *emptypb.Empty) (*emptypb.Empty, error) {
	panic("not implemented") // TODO: Implement
}
