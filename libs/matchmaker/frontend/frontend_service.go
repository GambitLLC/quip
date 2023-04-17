package frontend

import (
	"context"
	"fmt"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"github.com/rs/zerolog/log"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

type Service struct {
	store  statestore.Service
	broker broker.Client
	omfc   *omFrontendClient
	gc     *games.GameDetailCache
}

func New(cfg config.View) *Service {
	return &Service{
		store:  statestore.New(cfg),
		broker: broker.NewRedis(cfg),
		omfc:   newOmFrontendClient(cfg),
		gc:     games.NewGameDetailCache(),
	}
}

// getPlayer retrieves the player from the metadata attached to the context.
// Also locks the player mutex and returns an unlock function.
func getPlayer(ctx context.Context, store statestore.Service, create bool) (player *ipb.PlayerInternal, unlock func(), err error) {
	playerId := metautils.ExtractIncoming(ctx).Get("Player-Id")
	if playerId == "" {
		err = status.Error(codes.InvalidArgument, "missing Player-Id metadata")
		return
	}

	lock := store.NewMutex(fmt.Sprintf("player:%s", playerId))
	if err = lock.Lock(ctx); err != nil {
		err = status.Error(codes.Unavailable, err.Error())
		return
	}

	unlock = func() {
		// TODO: determine if unlock error needs to be handled
		_, _ = lock.Unlock(context.Background())
	}

	player, err = store.GetPlayer(ctx, playerId)
	if err != nil {
		if status.Code(err) != codes.NotFound || !create {
			unlock()
			return
		}

		player = &ipb.PlayerInternal{
			PlayerId: playerId,
		}
		err = store.CreatePlayer(ctx, player)
	}

	return
}

// GetStatus returns the current matchmaking status.
func (s *Service) GetStatus(ctx context.Context, _ *emptypb.Empty) (*pb.StatusResponse, error) {
	player, unlock, err := getPlayer(ctx, s.store, false)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return &pb.StatusResponse{
				Status: pb.Status_STATUS_IDLE,
			}, nil
		}

		// TODO: handle err instead of propagating
		return nil, err
	}
	defer unlock()

	if player.MatchId != nil {
		match, err := s.store.GetMatch(ctx, *player.MatchId)
		if err != nil {
			if status.Code(err) == codes.NotFound {
				go func() {
					// TODO: handle error
					_ = s.store.UntrackMatch(context.Background(), []string{player.PlayerId})
				}()

				return &pb.StatusResponse{
					Status: pb.Status_STATUS_IDLE,
				}, nil
			}

			// TODO: handle err instead of propagating
			return nil, err
		}

		return &pb.StatusResponse{
			Status: pb.Status_STATUS_PLAYING,
			Match: &pb.MatchFound{
				MatchId:    match.MatchId,
				Connection: match.Connection,
			},
		}, nil
	}

	if player.TicketId != nil {
		ticket, err := s.omfc.GetTicket(ctx, *player.TicketId)
		if err != nil {
			if status.Code(err) == codes.NotFound {
				go func() {
					// TODO: handle error
					_ = s.store.UntrackTicket(context.Background(), []string{player.PlayerId})
				}()

				return &pb.StatusResponse{
					Status: pb.Status_STATUS_IDLE,
				}, nil
			}

			// TODO: handle err instead of propagating
			return nil, err
		}

		// if ticket has been assigned, untrack it and assume player is idle
		// OpenMatch should have expired the ticket by this time
		if ticket.GetAssignment().GetConnection() != "" {
			go func() {
				// TODO: handle error
				_ = s.store.UntrackTicket(context.Background(), []string{player.PlayerId})
			}()

			return &pb.StatusResponse{
				Status: pb.Status_STATUS_IDLE,
			}, nil
		}

		details := &ipb.TicketInternal{}
		err = ticket.Extensions["details"].UnmarshalTo(details)
		if err != nil {
			// TODO: handle err instead of propagating
			return nil, err
		}

		return &pb.StatusResponse{
			Status: pb.Status_STATUS_SEARCHING,
			Queue: &pb.QueueSearching{
				Gamemode:  details.Gamemode,
				StartTime: ticket.CreateTime,
			},
		}, nil
	}

	return &pb.StatusResponse{
		Status: pb.Status_STATUS_IDLE,
	}, nil
}

// StartQueue starts searching for a match with the given parameters.
func (s *Service) StartQueue(ctx context.Context, req *pb.StartQueueRequest) (*emptypb.Empty, error) {
	player, unlock, err := getPlayer(ctx, s.store, true)
	if err != nil {
		return nil, err
	}
	defer unlock()

	gameCfg := req.GetConfig()
	if gameCfg == nil {
		return nil, status.Error(codes.InvalidArgument, ".Config is required")
	}

	game, err := s.gc.GameDetails(gameCfg.Gamemode)
	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	if game == nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid gamemode '%s'", gameCfg.Gamemode)
	}

	if player.MatchId != nil {
		return nil, status.Error(codes.FailedPrecondition, "player is already in queue")
	}

	if player.TicketId != nil {
		return nil, status.Error(codes.FailedPrecondition, "player is already in game")
	}

	ticket, err := s.omfc.CreateTicket(ctx, &ipb.TicketInternal{
		PlayerId: player.PlayerId,
		Gamemode: gameCfg.Gamemode,
	})
	if err != nil {
		return nil, err
	}

	players := []string{player.PlayerId}
	err = s.store.TrackTicket(ctx, ticket.Id, players)
	if err != nil {
		return nil, err
	}

	go s.publish(&pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Started{
			Started: &pb.QueueSearching{
				Gamemode:  gameCfg.Gamemode,
				StartTime: ticket.CreateTime,
			},
		},
	})

	go s.publish(&pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_STATUS_SEARCHING,
	})

	return &emptypb.Empty{}, nil
}

// StopQueue stops searching for a match. Idempotent.
func (s *Service) StopQueue(ctx context.Context, _ *emptypb.Empty) (*emptypb.Empty, error) {
	player, unlock, err := getPlayer(ctx, s.store, false)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return &emptypb.Empty{}, nil
		}

		return nil, err
	}
	defer unlock()

	if player.TicketId == nil {
		return &emptypb.Empty{}, nil
	}

	err = s.omfc.DeleteTicket(ctx, *player.TicketId)
	if err != nil && status.Code(err) != codes.NotFound {
		return nil, err
	}

	// TODO: get relevant players from ticket when multiple players is supported
	players := []string{player.PlayerId}

	err = s.store.UntrackTicket(ctx, players)
	if err != nil {
		return nil, err
	}

	reason := fmt.Sprintf("%s stopped matchmaking", player.PlayerId)
	go s.publish(&pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Finished{
			Finished: &pb.QueueFinished{
				Reason: &reason,
			},
		},
	})

	go s.publish(&pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_STATUS_IDLE,
	})

	return &emptypb.Empty{}, nil
}

func (s *Service) publish(msg proto.Message) {
	if s.broker == nil {
		log.Print("publish failed: broker is nil")
		return
	}

	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	switch msg := msg.(type) {
	default:
		err = fmt.Errorf("unhandled message type %T", msg)
	case *pb.QueueUpdate:
		err = s.broker.PublishQueueUpdate(ctx, msg)
	case *pb.StatusUpdate:
		err = s.broker.PublishStatusUpdate(ctx, msg)
	}

	if err != nil {
		log.Printf("publish failed: %v", err)
	}
}
