package matchmaker

import (
	"context"
	"fmt"

	"github.com/GambitLLC/quip/packages/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/packages/matchmaker/internal/statestore"
	"github.com/GambitLLC/quip/packages/matchmaker/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

type Service struct {
	store statestore.Service
}

// getPlayer retrieves the player from the metadata attached to the context.
// Also locks the player mutex and returns an unlock function.
func getPlayer(ctx context.Context, store statestore.Service) (player *ipb.PlayerInternal, unlock func(), err error) {
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
		unlock()
	}

	return
}

func getStatus(player *ipb.PlayerInternal) pb.StatusResponse_Status {
	if player.MatchId != nil {
		return pb.StatusResponse_PLAYING
	}

	if player.TicketId != nil {
		return pb.StatusResponse_SEARCHING
	}

	if len(player.Connections) > 0 {
		return pb.StatusResponse_IDLE
	}

	return pb.StatusResponse_OFFLINE
}

// GetStatus returns the current matchmaking status.
func (s *Service) GetStatus(ctx context.Context, _ *emptypb.Empty) (*pb.StatusResponse, error) {
	player, unlock, err := getPlayer(ctx, s.store)
	if err != nil {
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
	player, unlock, err := getPlayer(ctx, s.store)
	if err != nil {
		return nil, err
	}
	defer unlock()

	switch getStatus(player) {
	case pb.StatusResponse_OFFLINE:
		return nil, status.Error(codes.Aborted, "player is not online")
	case pb.StatusResponse_SEARCHING:
		return nil, status.Error(codes.Aborted, "player is already in queue")
	case pb.StatusResponse_PLAYING:
		return nil, status.Error(codes.Aborted, "player is already in game")
	}

	ticketId, err := createTicket(ctx, &ticketRequest{
		PlayerId: player.PlayerId,
		Gamemode: req.Gamemode,
	})
	if err != nil {
		return nil, err
	}

	err = s.store.TrackTicket(ctx, ticketId, []string{player.PlayerId})
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}

// StopQueue stops searching for a match. Idempotent.
func (s *Service) StopQueue(ctx context.Context, _ *emptypb.Empty) (*emptypb.Empty, error) {
	player, unlock, err := getPlayer(ctx, s.store)
	if err != nil {
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

	err = s.store.UntrackTicket(ctx, *player.TicketId)
	if err != nil {
		return nil, err
	}

	return &emptypb.Empty{}, nil
}
