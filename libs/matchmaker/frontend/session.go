package frontend

import (
	"context"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type session struct {
	svc *Service

	id    string
	out   chan *pb.PlayerUpdate
	close chan error
}

func (s *session) cleanup() {
	// stop queue
}

// TODO: redsync lock expiry defaults to 8 seconds
// should all methods have a lower timeout to avoid concurrency issues?
// const requestTimeout = 5 * time.Second

func (s *session) getPlayer(ctx context.Context) (*pb.Player, error) {
	lock := s.svc.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		logger.Err(err).Msgf("Failed to obtain lock for player '%s'", s.id)
		return nil, status.Error(codes.Internal, "Failed to obtain lock")
	}

	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	tid, mid, err := s.svc.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		return nil, err
	}

	if mid != "" {
		// TODO: get match information from statestore
		// match, err := s.statestore.GetMatch(ctx, mid)

		return &pb.Player{
			Id:    s.id,
			State: pb.PlayerState_PLAYER_STATE_PLAYING,
			Assignment: &pb.Player_MatchAssignment{
				MatchAssignment: &pb.MatchAssignment{
					Id: mid,
					// TODO: populate match information
				},
			},
		}, nil
	}

	if tid != "" {
		ticket, err := s.svc.omfc.GetTicket(ctx, tid)
		if err != nil {
			if status.Code(err) == codes.NotFound {
				// ticket was deleted already, unset ticket
				go s.svc.statestore.UnsetTicketId(context.Background(), []string{s.id})
				goto end
			}

			logger.Err(err).Str("player", s.id).Str("tid", ticket.Id).Msg("Failed to get ticket details from OpenMatch")
			return nil, status.Error(codes.Internal, "Failed to get player queue details")
		}

		// ticket has been assigned, unset ticket
		if ticket.GetAssignment().GetConnection() != "" {
			go s.svc.statestore.UnsetTicketId(context.Background(), []string{s.id})
			// TODO: maybe add a safety check for if the match is ongoing?
			// should be unnecessary in most cases...
			goto end
		}

		details, err := protoext.OpenMatchTicketDetails(ticket)
		if err != nil {
			logger.Err(err).Str("player", s.id).Str("tid", ticket.Id).Msg("Failed to parse Open Match ticket details")
			return nil, status.Error(codes.Internal, "Failed to get player queue details")
		}

		return &pb.Player{
			Id:    s.id,
			State: pb.PlayerState_PLAYER_STATE_SEARCHING,
			Assignment: &pb.Player_QueueAssignment{
				QueueAssignment: &pb.QueueAssignment{
					Id:        tid,
					Config:    details.Config,
					StartTime: ticket.CreateTime,
				},
			},
		}, nil
	}

end:
	return &pb.Player{
		Id:    s.id,
		State: pb.PlayerState_PLAYER_STATE_ONLINE,
	}, nil
}

func (s *session) startQueue(ctx context.Context, req *pb.StartQueueRequest) error {
	cfg := req.GetConfig()
	if cfg == nil {
		return status.Error(codes.InvalidArgument, ".Config is required")
	}

	if cfg.Gamemode == "" {
		return status.Error(codes.InvalidArgument, ".Config.Gamemode is required")
	}

	gamesListing, err := s.svc.games.Get()
	if err != nil {
		logger.Err(err).Msg("failed to get game listing")
		return status.Error(codes.Internal, "failed to get available games")
	}

	_, ok := gamesListing[cfg.Gamemode]
	if !ok {
		return status.Errorf(codes.InvalidArgument, "Invalid gamemode '%s'", cfg.Gamemode)
	}
	// TODO: when parties are available, confirm party size < max team size

	lock := s.svc.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		logger.Err(err).Msgf("Failed to obtain lock for player '%s'", s.id)
		return status.Error(codes.Internal, "Failed to obtain lock")
	}
	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	// Make sure player is not in game and not in queue
	tid, mid, err := s.svc.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		return err
	}

	if mid != "" {
		return status.Error(codes.FailedPrecondition, "Player is in game")
	}

	if tid != "" {
		return status.Error(codes.FailedPrecondition, "Player is in queue")
	}

	ticket, err := s.svc.omfc.CreateTicket(ctx, &pb.TicketDetails{
		PlayerId: s.id,
		Config:   cfg,
	})
	if err != nil {
		logger.Err(err).Msgf("Failed to create matchmaking ticket for player '%s'", s.id)
		return status.Error(codes.Internal, "Failed to start queue")
	}

	b, err := s.svc.statestore.SetTicketId(ctx, ticket.Id, []string{s.id})
	// SetTicketId should never return false because we confirmed tid was not set earlier
	// but check anyways for sanity
	if err != nil || !b {
		// setting ticket id failed -- delete ticket
		// TODO: handle delete ticket error?
		go s.svc.omfc.DeleteTicket(context.Background(), ticket.Id)

		logger.Err(err).Msgf("Failed to set ticket id for player '%s'", s.id)
		return status.Error(codes.Internal, "Failed to start queue")
	}

	// TODO: publish status update to broker so friends/party members are notified
	// err = s.svc.rb.Publish(
	// 	context.Background(),
	// 	broker.StatusUpdateRoute,
	// 	&pb.StatusUpdateMessage{
	// 		Targets: []string{s.id},
	// 		Update: &pb.StatusUpdate{
	// 			Update: &pb.StatusUpdate_QueueStarted{
	// 				QueueStarted: &pb.QueueAssignment{
	// 					Id:        ticket.Id,
	// 					Config:    cfg,
	// 					StartTime: ticket.CreateTime,
	// 				},
	// 			},
	// 		},
	// 	},
	// )

	s.out <- &pb.PlayerUpdate{
		Player: &pb.Player{
			Id:    s.id,
			State: pb.PlayerState_PLAYER_STATE_SEARCHING,
			Assignment: &pb.Player_QueueAssignment{
				QueueAssignment: &pb.QueueAssignment{
					Id:        ticket.Id,
					Config:    cfg,
					StartTime: ticket.CreateTime,
				},
			},
		},
		Update: &pb.StatusUpdate{
			Update: &pb.StatusUpdate_QueueStarted{
				QueueStarted: &pb.QueueAssignment{
					Id:        ticket.Id,
					Config:    cfg,
					StartTime: ticket.CreateTime,
				},
			},
		},
	}

	return nil
}

func (s *session) stopQueue(ctx context.Context) error {
	lock := s.svc.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		logger.Err(err).Str("player", s.id).Msgf("Failed to obtain lock")
		return status.Error(codes.Internal, "Failed to obtain lock")
	}
	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	tid, _, err := s.svc.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		logger.Err(err).Str("player", s.id).Msgf("Failed to get player from statestore")
		return status.Error(codes.Internal, "Failed to stop queue")
	}

	if tid == "" {
		return nil
	}

	err = s.svc.omfc.DeleteTicket(ctx, tid)
	if err != nil && status.Code(err) != codes.NotFound {
		logger.Err(err).Str("player", s.id).Str("ticket_id", tid).Msgf("Failed to delete ticket")
		return status.Error(codes.Unknown, "Failed to stop queue")
	}

	// TODO: unset for all players on the ticket when parties are implemented
	err = s.svc.statestore.UnsetTicketId(ctx, []string{s.id})
	if err != nil {
		logger.Err(err).Str("player", s.id).Str("ticket_id", tid).Msgf("Failed to unset ticket id")
		// do not return here -- not a big issue if tid isn't unset, it gets checked in other methods
	}

	// TODO: send msg to broker
	s.out <- &pb.PlayerUpdate{
		Player: &pb.Player{
			Id:    s.id,
			State: pb.PlayerState_PLAYER_STATE_ONLINE,
		},
		Update: &pb.StatusUpdate{
			Update: &pb.StatusUpdate_QueueStopped{
				QueueStopped: &pb.QueueStopped{
					Id:     tid,
					Reason: pb.Reason_REASON_PLAYER,
				},
			},
		},
	}

	return nil
}
