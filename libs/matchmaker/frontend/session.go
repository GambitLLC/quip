package frontend

import (
	"context"
	"io"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type session struct {
	srv pb.QuipFrontend_ConnectServer
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

	_ = ctx

	// TODO: access statestore
	s.out <- &pb.Response{
		Message: &pb.Response_Player{
			Player: &pb.Player{
				Id:    s.id,
				State: pb.PlayerState_PLAYER_STATE_IDLE,
			},
		},
	}

	return nil
}

// func (s *session) getStatus(req *pb.GetStatusRequest) (*pb.StreamResponse, error) {
// 	ctx, cancel := context.WithTimeout(s.stream.Context(), requestTimeout)
// 	defer cancel()

// 	lock := s.srv.store.NewMutex(s.id)
// 	if err := lock.Lock(ctx); err != nil {
// 		return nil, err
// 	}
// 	defer lock.Unlock(context.Background())

// 	status, err := getStatusDetails(ctx, s.id, s.srv.store, s.srv.omfc)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &pb.StreamResponse{
// 		Message: &pb.StreamResponse_StatusUpdate{
// 			StatusUpdate: status,
// 		},
// 	}, nil
// }

// func getStatusDetails(ctx context.Context, id string, store statestore.Service, omfc *omFrontendClient) (*pb.Status, error) {
// 	player, err := store.GetPlayer(ctx, id)
// 	if err != nil {
// 		if status.Code(err) == codes.NotFound {
// 			return &pb.Status{
// 				State: pb.State_STATE_IDLE,
// 			}, nil
// 		}

// 		return nil, err
// 	}

// 	if player.MatchId != nil {
// 		match, err := store.GetMatch(ctx, *player.MatchId)
// 		if err != nil {
// 			if status.Code(err) == codes.NotFound {
// 				go func() {
// 					// TODO: handle error
// 					_ = store.UntrackMatch(context.Background(), []string{player.PlayerId})
// 				}()

// 				return &pb.Status{
// 					State: pb.State_STATE_IDLE,
// 				}, nil
// 			}

// 			// TODO: handle err instead of propagating
// 			return nil, err
// 		}

// 		return &pb.Status{
// 			State: pb.State_STATE_PLAYING,
// 			Details: &pb.Status_Matched{
// 				Matched: &pb.MatchDetails{
// 					MatchId:    match.MatchId,
// 					Connection: match.Connection,
// 				},
// 			},
// 		}, nil
// 	}

// 	if player.TicketId != nil {
// 		ticket, err := omfc.GetTicket(ctx, *player.TicketId)
// 		if err != nil {
// 			if status.Code(err) == codes.NotFound {
// 				go func() {
// 					// TODO: handle error
// 					_ = store.UntrackTicket(context.Background(), []string{player.PlayerId})
// 				}()

// 				return &pb.Status{
// 					State: pb.State_STATE_IDLE,
// 				}, nil
// 			}

// 			// TODO: handle err instead of propagating
// 			return nil, err
// 		}

// 		// if ticket has been assigned, untrack it and assume player is idle
// 		// OpenMatch should have expired the ticket by this time
// 		if ticket.GetAssignment().GetConnection() != "" {
// 			go func() {
// 				// TODO: handle error
// 				_ = store.UntrackTicket(context.Background(), []string{player.PlayerId})
// 			}()

// 			return &pb.Status{
// 				State: pb.State_STATE_IDLE,
// 			}, nil
// 		}

// 		details, err := protoext.OpenMatchTicketDetails(ticket)
// 		if err != nil {
// 			// TODO: handle err instead of propagating
// 			return nil, err
// 		}

// 		return &pb.Status{
// 			State: pb.State_STATE_SEARCHING,
// 			Details: &pb.Status_Searching{
// 				Searching: &pb.QueueDetails{
// 					Config: &pb.GameConfiguration{
// 						Gamemode: details.Gamemode,
// 					},
// 					StartTime: ticket.CreateTime,
// 				},
// 			},
// 		}, nil
// 	}

// 	return &pb.Status{
// 		State: pb.State_STATE_IDLE,
// 	}, nil
// }

// func (s *session) startQueue(req *pb.StartQueueRequest) (*pb.StreamResponse, error) {
// 	ctx, cancel := context.WithTimeout(s.stream.Context(), requestTimeout)
// 	defer cancel()

// 	lock := s.srv.store.NewMutex(s.id)
// 	if err := lock.Lock(ctx); err != nil {
// 		return nil, err
// 	}
// 	defer lock.Unlock(context.Background())

// 	player, err := s.srv.store.GetPlayer(ctx, s.id)
// 	if status.Code(err) == codes.NotFound {
// 		player = &ipb.PlayerDetails{
// 			PlayerId: s.id,
// 		}
// 		err = s.srv.store.CreatePlayer(ctx, player)
// 	}

// 	if err != nil {
// 		return nil, err
// 	}

// 	gameCfg := req.GetConfig()
// 	if gameCfg == nil {
// 		return &pb.StreamResponse{
// 			Message: &pb.StreamResponse_Error{
// 				Error: &rpcStatus.Status{
// 					Code:    int32(codes.InvalidArgument),
// 					Message: ".Config is required",
// 				},
// 			},
// 		}, nil
// 	}

// 	game, err := s.srv.gc.GameDetails(gameCfg.Gamemode)
// 	if err != nil {
// 		return nil, status.Error(codes.Internal, err.Error())
// 	}

// 	if game == nil {
// 		return &pb.StreamResponse{
// 			Message: &pb.StreamResponse_Error{
// 				Error: &rpcStatus.Status{
// 					Code:    int32(codes.InvalidArgument),
// 					Message: fmt.Sprintf("invalid gamemode: '%s'", gameCfg.Gamemode),
// 				},
// 			},
// 		}, nil
// 	}

// 	if player.MatchId != nil {
// 		return &pb.StreamResponse{
// 			Message: &pb.StreamResponse_Error{
// 				Error: &rpcStatus.Status{
// 					Code:    int32(codes.FailedPrecondition),
// 					Message: "already in game",
// 				},
// 			},
// 		}, nil
// 	}

// 	if player.TicketId != nil {
// 		return &pb.StreamResponse{
// 			Message: &pb.StreamResponse_Error{
// 				Error: &rpcStatus.Status{
// 					Code:    int32(codes.FailedPrecondition),
// 					Message: "already in queue",
// 				},
// 			},
// 		}, nil
// 	}

// 	ticket, err := s.srv.omfc.CreateTicket(ctx, &ipb.TicketDetails{
// 		PlayerId: player.PlayerId,
// 		Gamemode: gameCfg.Gamemode,
// 	})
// 	if err != nil {
// 		// TODO: handle error, this probably shouldn't be propagated
// 		return &pb.StreamResponse{
// 			Message: &pb.StreamResponse_Error{
// 				Error: &rpcStatus.Status{
// 					Code:    int32(status.Code(err)),
// 					Message: err.Error(),
// 				},
// 			},
// 		}, nil
// 	}

// 	players := []string{player.PlayerId}
// 	err = s.srv.store.TrackTicket(ctx, ticket.Id, players)
// 	if err != nil {
// 		// if tracking failed, delete the ticket ...
// 		go func() {
// 			// TODO: handle error
// 			_ = s.srv.omfc.DeleteTicket(context.Background(), player.PlayerId)
// 		}()

// 		return nil, err
// 	}

// 	// go s.publish(&pb.StatusUpdate{
// 	// 	Targets: players,
// 	// 	Status: &pb.Status{
// 	// 		State: pb.State_STATE_SEARCHING,
// 	// 	},
// 	// })

// 	return &pb.StreamResponse{
// 		Message: &pb.StreamResponse_StatusUpdate{
// 			StatusUpdate: &pb.Status{
// 				State: pb.State_STATE_SEARCHING,
// 				Details: &pb.Status_Searching{
// 					Searching: &pb.QueueDetails{
// 						Config:    gameCfg,
// 						StartTime: ticket.CreateTime,
// 					},
// 				},
// 			},
// 		},
// 	}, nil
// }

// func (s *session) stopQueue(req *emptypb.Empty) (*pb.StreamResponse, error) {
// 	ctx, cancel := context.WithTimeout(s.stream.Context(), requestTimeout)
// 	defer cancel()

// 	lock := s.srv.store.NewMutex(s.id)
// 	if err := lock.Lock(ctx); err != nil {
// 		return nil, err
// 	}
// 	defer lock.Unlock(context.Background())

// 	player, err := s.srv.store.GetPlayer(ctx, s.id)
// 	if status.Code(err) == codes.NotFound {
// 		return nil, nil
// 	}

// 	if err != nil {
// 		return nil, err
// 	}

// 	if player.TicketId == nil {
// 		return nil, nil
// 	}

// 	err = s.srv.omfc.DeleteTicket(ctx, *player.TicketId)
// 	if err != nil && status.Code(err) != codes.NotFound {
// 		return nil, err
// 	}

// 	// TODO: get relevant players from ticket when multiple players is supported
// 	players := []string{player.PlayerId}

// 	err = s.srv.store.UntrackTicket(ctx, players)
// 	if err != nil {
// 		return nil, err
// 	}

// 	// go s.publish(&pb.StatusUpdate{
// 	// 	Targets: players,
// 	// 	Status: &pb.Status{
// 	// 		State: pb.State_STATE_IDLE,
// 	// 		Details: &pb.Status_Stopped{
// 	// 			Stopped: &pb.QueueStopped{
// 	// 				Message: fmt.Sprintf("%s stopped matchmaking", player.PlayerId),
// 	// 			},
// 	// 		},
// 	// 	},
// 	// })

// 	return &pb.StreamResponse{
// 		Message: &pb.StreamResponse_StatusUpdate{
// 			StatusUpdate: &pb.Status{
// 				State: pb.State_STATE_IDLE,
// 				Details: &pb.Status_Stopped{
// 					Stopped: &pb.QueueStopped{
// 						Message: fmt.Sprintf("%s stopped matchmaking", player.PlayerId),
// 					},
// 				},
// 			},
// 		},
// 	}, nil
// }
