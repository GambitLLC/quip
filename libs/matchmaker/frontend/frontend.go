package frontend

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/libs/pb"
)

type Service struct {
	store  statestore.Service
	broker broker.Client
}

func New(cfg config.View) *Service {
	return &Service{
		store:  statestore.New(cfg),
		broker: broker.NewRedis(cfg),
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

func getStatus(player *ipb.PlayerInternal) pb.Status {
	if player.MatchId != nil {
		return pb.Status_PLAYING
	}

	if player.TicketId != nil {
		return pb.Status_SEARCHING
	}

	return pb.Status_IDLE
}

// GetStatus returns the current matchmaking status.
func (s *Service) GetStatus(ctx context.Context, _ *emptypb.Empty) (*pb.StatusResponse, error) {
	player, unlock, err := getPlayer(ctx, s.store, false)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return &pb.StatusResponse{
				Status: pb.Status_IDLE,
			}, nil
		}
		return nil, err
	}
	defer unlock()

	resp := &pb.StatusResponse{
		Status: getStatus(player),
	}

	// TODO: match details or ticket details
	// if status == pb.StatusResponse_PLAYING {
	// }
	// if status == pb.StatusResponse_SEARCHING {
	// }

	return resp, nil
}

// StartQueue starts searching for a match with the given parameters.
func (s *Service) StartQueue(ctx context.Context, req *pb.StartQueueRequest) (*emptypb.Empty, error) {
	player, unlock, err := getPlayer(ctx, s.store, true)
	if err != nil {
		return nil, err
	}
	defer unlock()

	switch getStatus(player) {
	case pb.Status_SEARCHING:
		return nil, status.Error(codes.Aborted, "player is already in queue")
	case pb.Status_PLAYING:
		return nil, status.Error(codes.Aborted, "player is already in game")
	}

	ticketId, err := createTicket(ctx, &ticketRequest{
		PlayerId: player.PlayerId,
		Gamemode: req.Gamemode,
	})
	if err != nil {
		return nil, err
	}

	players := []string{player.PlayerId}
	err = s.store.TrackTicket(ctx, ticketId, players)
	if err != nil {
		return nil, err
	}

	go s.publish(&pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Started{
			Started: &pb.QueueDetails{
				Gamemode: req.Gamemode,
				// StartTime: ,
			},
		},
	})

	go s.publish(&pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_SEARCHING,
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

	err = deleteTicket(ctx, *player.TicketId)
	if err != nil && status.Code(err) != codes.NotFound {
		return nil, err
	}

	// TODO: get relevant players from ticket when multiple players is supported
	players := []string{player.PlayerId}

	err = s.store.UntrackTicket(ctx, players)
	if err != nil {
		return nil, err
	}

	go s.publish(&pb.QueueUpdate{
		Targets: players,
		Update: &pb.QueueUpdate_Stopped{
			Stopped: player.PlayerId,
		},
	})

	go s.publish(&pb.StatusUpdate{
		Targets: players,
		Status:  pb.Status_IDLE,
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
