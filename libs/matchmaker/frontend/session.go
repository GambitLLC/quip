package frontend

import (
	"context"
	"fmt"
	"io"
	"time"

	rpcstatus "google.golang.org/genproto/googleapis/rpc/status"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type session struct {
	srv        pb.QuipFrontend_ConnectServer
	statestore statestore.Service
	omfc       *omFrontendClient

	id  string
	out chan *pb.Response
}

// recv consumes from the stream and handles all requests until the stream closes.
func (s *session) recv() error {
	for {
		in, err := s.srv.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		switch msg := in.Action.(type) {
		default:
			return status.Errorf(codes.Internal, ".Action type '%T' is not supported", msg)
		case nil:
			return status.Error(codes.Internal, ".Action is nil")
		case *pb.Request_GetPlayer:
			err = s.getPlayer(msg)
		case *pb.Request_StartQueue:
			err = s.startQueue(msg)
		case *pb.Request_StopQueue:
			err = s.stopQueue(msg)
			// TODO: actually handle the different action types
		}

		// TODO: handle err
		if err != nil {
			return err
		}
	}
}

// send consumes from the session's out channel and sends them to the stream until closed.
func (s *session) send() {
	for {
		select {
		case <-s.srv.Context().Done():
			s.cleanup()
			return
		case msg := <-s.out:
			err := s.srv.Send(msg)
			if s, ok := status.FromError(err); ok {
				switch s.Code() {
				case codes.OK:
					// noop
				case codes.Canceled, codes.DeadlineExceeded:
					// client closed
					return
				default:
					logger.Err(s.Err()).Msg("stream.Send failed")
				}
			} else {
				logger.Err(err).Msg("stream.Send failed")
			}
		}
	}
}

func (s *session) cleanup() {
	// stop queue
}

const requestTimeout = 10 * time.Second

func (s *session) getPlayer(req *pb.Request_GetPlayer) error {
	ctx, cancel := context.WithTimeout(s.srv.Context(), requestTimeout)
	defer cancel()

	lock := s.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		return err
	}
	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	tid, mid, err := s.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		return err
	}

	if mid != "" {
		// TODO: get match information from statestore
		// match, err := s.statestore.GetMatch(ctx, mid)

		s.out <- &pb.Response{
			Message: &pb.Response_Player{
				Player: &pb.Player{
					Id:    s.id,
					State: pb.PlayerState_PLAYER_STATE_PLAYING,
					Assignment: &pb.Player_MatchAssignment{
						MatchAssignment: &pb.MatchAssignment{
							Id: mid,
							// TODO: populate match information
						},
					},
				},
			},
		}
		return nil
	}

	if tid != "" {
		ticket, err := s.omfc.GetTicket(ctx, tid)
		if err != nil {
			if status.Code(err) == codes.NotFound {
				// ticket was deleted already, unset ticket
				// TODO: handle error
				go s.statestore.UnsetTicketId(context.Background(), []string{s.id})
				goto end
			}

			// TODO: handle err
			return err
		}

		// ticket has been assigned, unset ticket
		if ticket.GetAssignment().GetConnection() != "" {
			go s.statestore.UnsetTicketId(context.Background(), []string{s.id})
			// TODO: maybe add a safety check for if the match is ongoing?
			// should be unnecessary in most cases...
			goto end
		}

		details, err := protoext.OpenMatchTicketDetails(ticket)
		if err != nil {
			// TODO: handle err
			return err
		}

		s.out <- &pb.Response{
			Message: &pb.Response_Player{
				Player: &pb.Player{
					Id:    s.id,
					State: pb.PlayerState_PLAYER_STATE_SEARCHING,
					Assignment: &pb.Player_QueueAssignment{
						QueueAssignment: &pb.QueueAssignment{
							Id:        tid,
							Config:    details.Config,
							StartTime: ticket.CreateTime,
							// TODO: get ticket information from open match
						},
					},
				},
			},
		}
		return nil
	}

end:
	s.out <- &pb.Response{
		Message: &pb.Response_Player{
			Player: &pb.Player{
				Id:    s.id,
				State: pb.PlayerState_PLAYER_STATE_ONLINE,
			},
		},
	}

	return nil
}

func (s *session) startQueue(req *pb.Request_StartQueue) error {
	cfg := req.StartQueue.GetConfig()
	if cfg == nil {
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.InvalidArgument),
					Message: ".Config is required",
				},
			},
		}
		return nil
	}

	if cfg.Gamemode == "" {
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.InvalidArgument),
					Message: ".Config.Gamemode is required",
				},
			},
		}
		return nil
	}

	// TODO: validate config (e.g. check gamemode exists)

	ctx, cancel := context.WithTimeout(s.srv.Context(), requestTimeout)
	defer cancel()

	lock := s.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		return err
	}
	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	// Make sure player is not in game and not in queue
	tid, mid, err := s.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		return err
	}

	if mid != "" {
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.FailedPrecondition),
					Message: "Player is in game",
				},
			},
		}

		return nil
	}

	if tid != "" {
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.FailedPrecondition),
					Message: "Player is in queue",
				},
			},
		}

		return nil
	}

	ticket, err := s.omfc.CreateTicket(ctx, &pb.TicketDetails{
		PlayerId: s.id,
		Config:   cfg,
	})
	if err != nil {
		// TODO: handle error, probably shouldn't propagate to player
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.Internal),
					Message: fmt.Sprintf("Failed to create matchmaking ticket: %s", err.Error()),
				},
			},
		}
	}

	b, err := s.statestore.SetTicketId(ctx, ticket.Id, []string{s.id})
	// SetTicketId should never return false because we confirmed tid was not set earlier
	// but check anyways for sanity
	if err != nil || !b {
		// setting ticket id failed -- delete ticket
		// TODO: handle delete ticket error
		go s.omfc.DeleteTicket(context.Background(), ticket.Id)

		// TODO: handle error, probably shouldn't propagate to player
		s.out <- &pb.Response{
			Message: &pb.Response_Error{
				Error: &rpcstatus.Status{
					Code:    int32(codes.Internal),
					Message: fmt.Sprintf("Failed to set ticket id: %s", err.Error()),
				},
			},
		}
	}

	// TODO: publish status update to broker so friends/party members are notified

	s.out <- &pb.Response{
		Message: &pb.Response_StatusUpdate{
			StatusUpdate: &pb.StatusUpdate{
				Update: &pb.StatusUpdate_QueueStarted{
					QueueStarted: &pb.QueueAssignment{
						Id:        ticket.Id,
						Config:    cfg,
						StartTime: ticket.CreateTime,
					},
				},
			},
		},
	}

	return nil
}

func (s *session) stopQueue(req *pb.Request_StopQueue) error {
	ctx, cancel := context.WithTimeout(s.srv.Context(), requestTimeout)
	defer cancel()

	lock := s.statestore.NewMutex(s.id)
	if err := lock.Lock(ctx); err != nil {
		return err
	}
	// TODO: handle unlock error?
	defer lock.Unlock(context.Background())

	tid, _, err := s.statestore.GetPlayer(ctx, s.id)
	if err != nil {
		// TODO: handle err
		return err
	}

	if tid == "" {
		return nil
	}

	err = s.omfc.DeleteTicket(ctx, tid)
	if err != nil && status.Code(err) != codes.NotFound {
		// TODO: handle err
		return err
	}

	// TODO: unset for all players on the ticket when that is implemented
	err = s.statestore.UnsetTicketId(ctx, []string{s.id})
	if err != nil {
		// TODO: handle err
		return err
	}

	s.out <- &pb.Response{
		Message: &pb.Response_StatusUpdate{
			StatusUpdate: &pb.StatusUpdate{
				Update: &pb.StatusUpdate_QueueStopped{
					QueueStopped: &pb.QueueStopped{
						Id:     tid,
						Reason: pb.Reason_REASON_PLAYER,
					},
				},
			},
		},
	}

	return nil
}
