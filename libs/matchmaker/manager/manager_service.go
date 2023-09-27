package manager

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type Service struct {
	cfg       config.View
	store     statestore.Service
	omBackend *omBackendClient
	broker    *broker.RedisBroker
}

func New(cfg config.View) *Service {
	return &Service{
		cfg: cfg,
		store: statestore.New(cfg),
		omBackend: newOMBackendClient(cfg),
		broker: broker.NewRedisBroker(cfg),
	}
}

// CreateMatch should be called by gameservers when they are allocated. It will attempt
// to mark all players in the roster as participants in the match.
func (s *Service) CreateMatch(ctx context.Context, req *pb.CreateMatchRequest) (*emptypb.Empty, error) {
	if req.GetMatchId() == "" {
		return nil, status.Error(codes.InvalidArgument, ".MatchId is required")
	}

	if len(req.GetRoster().GetPlayers()) == 0 {
		return nil, status.Error(codes.InvalidArgument, ".Roster.Players must not be empty")
	}

	ticketIds, err := s.store.GetTicketIds(ctx, req.Roster.Players)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "store.GetTicketIds failed: %v", err)
	}
	// TODO: does ticketIds need to be validated (e.g. for empty strings)?

	// TODO: is it necessary to acquire the lock for every player?
	b, err := s.store.SetMatchId(ctx, req.MatchId, req.Roster.Players)
	if err != nil {
		// TODO: handle error
		go s.omBackend.ReleaseTickets(context.Background(), &ompb.ReleaseTicketsRequest{
			TicketIds: ticketIds,
		})
		return nil, status.Errorf(codes.Internal, "store.SetMatchId failed: %v", err)
	}

	if !b {
		// TODO: handle error
		go s.omBackend.ReleaseTickets(context.Background(), &ompb.ReleaseTicketsRequest{
			TicketIds: ticketIds,
		})
		return nil, status.Error(codes.FailedPrecondition, "failed to set match id for some players")
	}

	// TODO: store match details in statestore so it can be fetched later

	// TODO: handle AssignTicketsResponse (failed ticketids)
	_, err = s.omBackend.AssignTickets(ctx, &ompb.AssignTicketsRequest{
		Assignments: []*ompb.AssignmentGroup{
			{
				TicketIds: ticketIds,
				Assignment: &ompb.Assignment{
					Connection: "connection", // TODO: get connection from request
				},
			},
		},
	})
	if err != nil {
		// TODO: handle error
		go s.store.UnsetMatchId(context.Background(), req.Roster.Players)
		return nil, status.Errorf(codes.Internal, "AssignTickets failed: %v", err)
	}

	go s.broker.Publish(context.Background(), broker.StatusUpdateRoute, &pb.StatusUpdate{
		Update: &pb.StatusUpdate_MatchFound{
			MatchFound: &pb.MatchFound{
				MatchId: req.MatchId,
			},
		},
	})

	return &emptypb.Empty{}, nil
}

// CancelMatch should be called if gameservers do not start play for any reason.
func (s *Service) CancelMatch(ctx context.Context, req *pb.CancelMatchRequest) (*emptypb.Empty, error) {
	// TODO: update match state in statestore
	go s.broker.Publish(context.Background(), broker.StatusUpdateRoute, &pb.StatusUpdateMessage{
		Targets: []string{}, // TODO: get targets from statestore
		Update: &pb.StatusUpdate{
			Update: &pb.StatusUpdate_MatchCancelled{
				MatchCancelled: &pb.MatchCancelled{
					MatchId: req.MatchId,
				},
			},
		},
	})

	return &emptypb.Empty{}, nil
}

// FinishMatch should be called when gameservers finish play.
func (s *Service) FinishMatch(ctx context.Context, req *pb.FinishMatchRequest) (*emptypb.Empty, error) {
	// TODO: update match state in statestore

	// TODO: get players from statestore
	players := []string{}
	
	// eventually unset match id: now that statestore has marked match as finished
	// frontend will not really care even if match id is set
	// TODO: handle error
	go s.store.UnsetMatchId(context.Background(), players)

	go s.broker.Publish(context.Background(), broker.StatusUpdateRoute, &pb.StatusUpdateMessage{
		Targets: players,
		Update: &pb.StatusUpdate{
			Update: &pb.StatusUpdate_MatchFinished{
				MatchFinished: &pb.MatchFinished{
					MatchId: req.MatchId,
				},
			},
		},
	})

	return &emptypb.Empty{}, nil
}

