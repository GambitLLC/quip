package backend

import (
	"context"
	"os"

	"github.com/rs/zerolog"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.backend").
	Logger()

type Service struct {
	store  statestore.Service
	agones *agonesAllocationClient
	broker broker.Client
}

func New(cfg config.View) *Service {
	return &Service{
		store:  statestore.New(cfg),
		agones: newAgonesAllocationClient(cfg),
		broker: broker.NewRedis(cfg),
	}
}

func (s *Service) AllocateMatch(ctx context.Context, req *pb.AllocateMatchRequest) (resp *pb.MatchDetails, err error) {
	gameCfg := req.GetGameConfig()
	if gameCfg == nil {
		return nil, status.Error(codes.InvalidArgument, ".GameConfig is required")
	}

	roster := req.GetRoster()
	if roster == nil {
		return nil, status.Error(codes.InvalidArgument, ".Roster is required")
	}

	if req.MatchId == "" {
		return nil, status.Error(codes.InvalidArgument, ".MatchId is required")
	}

	players := roster.Players
	if len(players) == 0 {
		return nil, status.Error(codes.InvalidArgument, ".Roster has no players")
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
		Players:    players,
	})
	if err != nil {
		return nil, err
	}

	// TODO: health check stuff?

	return &pb.MatchDetails{
		Connection: ip,
	}, nil
}

func (s *Service) FinishMatch(ctx context.Context, req *pb.FinishMatchRequest) (*emptypb.Empty, error) {
	match, err := s.store.GetMatch(ctx, req.MatchId)
	if err != nil {
		return nil, err
	}

	err = s.store.UntrackMatch(ctx, match.Players)
	if err != nil {
		return nil, err
	}

	go s.broker.PublishStatusUpdate(context.Background(), &pb.StatusUpdate{
		Targets: match.Players,
		Status: &pb.Status{
			State: pb.State_STATE_IDLE,
			Details: &pb.Status_Stopped{
				Stopped: &pb.QueueStopped{
					Message: "match finished",
				},
			},
		},
	})

	err = s.store.DeleteMatch(ctx, req.MatchId)
	if err != nil {
		// DeleteMatch failing is not very important because match has been untracked
		// Match will eventually expire in statestore
		logger.Warn().Err(err).Msg("Failed to delete match from statestore")
	}

	return &emptypb.Empty{}, nil
}
