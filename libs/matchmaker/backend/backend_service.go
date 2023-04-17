package backend

import (
	"context"

	"github.com/rs/zerolog/log"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

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
		Players:    players,
	})
	if err != nil {
		return nil, err
	}

	// TODO: health check stuff?

	return &pb.CreateMatchResponse{
		Connection: ip,
	}, nil
}

func (s *Service) DeleteMatch(ctx context.Context, req *pb.DeleteMatchRequest) (*emptypb.Empty, error) {
	match, err := s.store.GetMatch(ctx, req.MatchId)
	if err != nil {
		return nil, err
	}

	err = s.store.UntrackMatch(ctx, match.Players)
	if err != nil {
		return nil, err
	}

	reason := "match has finished"
	go s.broker.PublishQueueUpdate(context.Background(), &pb.QueueUpdate{
		Targets: match.Players,
		Update: &pb.QueueUpdate_Finished{
			Finished: &pb.QueueFinished{
				Reason: &reason,
			},
		},
	})

	go s.broker.PublishStatusUpdate(context.Background(), &pb.StatusUpdate{
		Targets: match.Players,
		Status:  pb.Status_STATUS_IDLE,
	})

	err = s.store.DeleteMatch(ctx, req.MatchId)
	if err != nil {
		// DeleteMatch failing is not very important because match has been untracked
		// Match will eventually expire in statestore
		log.Printf("DeleteMatch failed: %s", err.Error())
	}

	return &emptypb.Empty{}, nil
}
