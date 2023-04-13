package backend

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

type Service struct {
	store  statestore.Service
	agones *agonesAllocationClient
}

func New(cfg config.View) *Service {
	return &Service{
		store:  statestore.New(cfg),
		agones: newAgonesAllocationClient(cfg),
	}
}

func (s *Service) CreateMatch(ctx context.Context, req *pb.CreateMatchRequest) (resp *pb.CreateMatchResponse, err error) {
	gameCfg := req.GetGameConfig()
	if gameCfg == nil {
		return nil, status.Error(codes.InvalidArgument, ".GameConfig is required")
	}

	matchDetails := req.GetMatchDetails()
	if matchDetails == nil {
		return nil, status.Error(codes.InvalidArgument, ".MatchDetails is required")
	}

	if req.MatchId == "" {
		return nil, status.Error(codes.InvalidArgument, ".MatchId is required")
	}

	players := make([]string, 0, len(matchDetails.Teams))
	for _, team := range matchDetails.Teams {
		players = append(players, team.Players...)
	}

	if len(players) == 0 {
		return nil, status.Error(codes.InvalidArgument, ".MatchDetails.Teams has no players")
	}

	// TODO: track match should return players who failed in order to better handle
	// when players are already in a match
	err = s.store.TrackMatch(ctx, req.MatchId, players)
	if err != nil {
		return nil, err
	}

	defer func() {
		if resp == nil {
			go func() {
				// TODO: handle error?
				_ = s.store.UntrackMatch(context.Background(), players)
			}()
		}
	}()

	ip, err := s.agones.Allocate(ctx, req)
	if err != nil {
		// TODO: check err, don't just propagate
		return nil, err
	}

	err = s.store.CreateMatch(ctx, &ipb.MatchInternal{
		MatchId:    req.MatchId,
		Connection: ip,
		State:      ipb.MatchInternal_STATE_PENDING,
	})
	if err != nil {
		return nil, err
	}

	// TODO: health check stuff?

	return &pb.CreateMatchResponse{
		Connection: ip,
	}, nil
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
