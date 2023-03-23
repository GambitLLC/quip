package frontend

import (
	"context"
	"net"
	"sync"
	"testing"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
	"github.com/GambitLLC/quip/libs/pb"
	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

func TestService(t *testing.T) {
	t.Run("all methods should expect Player-Id metadata", func(t *testing.T) {
		s := &Service{}
		ctx := context.Background()

		_, err := s.GetStatus(ctx, nil)
		require.Error(t, err, "GetStatus should return error")

		_, err = s.StartQueue(ctx, nil)
		require.Error(t, err, "StartQueue should return error")

		_, err = s.StopQueue(ctx, nil)
		require.Error(t, err, "StopQueue should return error")
	})
}

func TestGetStatus(t *testing.T) {
	playerId := xid.New().String()
	ctx := newContextWithPlayer(t, playerId)
	randomId := xid.New().String()

	tests := []struct {
		name  string
		setup func(*testing.T, statestore.Service)
		ctx   context.Context
		check func(*testing.T, *pb.StatusResponse, error)
	}{
		{
			name:  "expect IDLE status",
			setup: nil,
			ctx:   ctx,
			check: func(t *testing.T, sr *pb.StatusResponse, err error) {
				require.NoError(t, err)
				require.Equal(t, pb.Status_IDLE, sr.Status, "expected status to be IDLE")
			},
		},
		{
			name: "expect SEARCHING status",
			setup: func(t *testing.T, s statestore.Service) {
				s.CreatePlayer(ctx, &ipb.PlayerInternal{
					PlayerId: playerId,
					TicketId: &randomId,
				})
			},
			ctx: ctx,
			check: func(t *testing.T, sr *pb.StatusResponse, err error) {
				require.NoError(t, err)
				require.Equal(t, pb.Status_SEARCHING, sr.Status, "expected status to be SEARCHING")
			},
		},
		{
			name: "expect PLAYING status",
			setup: func(t *testing.T, s statestore.Service) {
				s.CreatePlayer(ctx, &ipb.PlayerInternal{
					PlayerId: playerId,
					MatchId:  &randomId,
				})
			},
			ctx: ctx,
			check: func(t *testing.T, sr *pb.StatusResponse, err error) {
				require.NoError(t, err)
				require.Equal(t, pb.Status_PLAYING, sr.Status, "expected status to be PLAYING")
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newService(t)

			if tt.setup != nil {
				tt.setup(t, s.store)
			}

			got, err := s.GetStatus(tt.ctx, &emptypb.Empty{})
			tt.check(t, got, err)
		})
	}
}

func TestStartQueueStatestore(t *testing.T) {
	playerId := xid.New().String()
	ctx := newContextWithPlayer(t, playerId)

	type args struct {
		ctx context.Context
		req *pb.StartQueueRequest
	}
	tests := []struct {
		name    string
		setup   func(*testing.T, statestore.Service)
		args    args
		wantErr bool
		check   func(*testing.T, context.Context, statestore.Service)
	}{
		{
			name:  "expect ticket id to be set",
			setup: nil,
			args: args{
				ctx: ctx,
				req: &pb.StartQueueRequest{
					Gamemode: "test",
				},
			},
			check: func(t *testing.T, ctx context.Context, s statestore.Service) {
				player, err := s.GetPlayer(ctx, playerId)
				require.NoError(t, err, "GetPlayer failed")
				require.NotEmpty(t, player.TicketId, "player TicketId is not set")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newService(t)

			if tt.setup != nil {
				tt.setup(t, s.store)
			}

			_, err := s.StartQueue(tt.args.ctx, tt.args.req)
			if tt.wantErr {
				require.Error(t, err, "wantErr = true, StartQueue returned nil")
			} else {
				require.NoError(t, err, "wantErr = false, StartQueue failed")
			}

			ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
			t.Cleanup(cancel)

			tt.check(t, ctx, s.store)
		})
	}
}

func TestStartQueueBehaviour(t *testing.T) {
	playerId := xid.New().String()
	ctx := newContextWithPlayer(t, playerId)
	randomId := xid.New().String()

	type args struct {
		ctx context.Context
		req *pb.StartQueueRequest
	}
	tests := []struct {
		name  string
		setup func(*testing.T, statestore.Service)
		args  args
		check func(*testing.T, error)
	}{
		{
			name:  "expect success with normal input",
			setup: nil,
			args: args{
				ctx: ctx,
				req: &pb.StartQueueRequest{
					Gamemode: "test",
				},
			},
			check: func(t *testing.T, err error) {
				require.NoError(t, err)
			},
		},
		{
			name:  "expect error with invalid gamemode",
			setup: nil,
			args: args{
				ctx: ctx,
				req: &pb.StartQueueRequest{
					Gamemode: "invalid gamemode",
				},
			},
			check: func(t *testing.T, err error) {
				require.Error(t, err)
			},
		},
		{
			name: "expect error if already queued",
			setup: func(t *testing.T, s statestore.Service) {
				s.CreatePlayer(ctx, &ipb.PlayerInternal{
					PlayerId: playerId,
					TicketId: &randomId,
				})
			},
			args: args{
				ctx: ctx,
				req: &pb.StartQueueRequest{
					Gamemode: "test",
				},
			},
			check: func(t *testing.T, err error) {
				require.Error(t, err)
			},
		},
		{
			name: "expect error if already in game",
			setup: func(t *testing.T, s statestore.Service) {
				s.CreatePlayer(ctx, &ipb.PlayerInternal{
					PlayerId: playerId,
					MatchId:  &randomId,
				})
			},
			args: args{
				ctx: ctx,
				req: &pb.StartQueueRequest{
					Gamemode: "test",
				},
			},
			check: func(t *testing.T, err error) {
				require.Error(t, err)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newService(t)

			if tt.setup != nil {
				tt.setup(t, s.store)
			}

			_, err := s.StartQueue(tt.args.ctx, tt.args.req)
			tt.check(t, err)
		})
	}
}

func TestStopQueue(t *testing.T) {
	tests := []struct {
		name  string
		setup func(*testing.T, statestore.Service)
		ctx   context.Context
		check func(*testing.T, error)
	}{
		{
			name:  "expect success when not in queue",
			setup: nil,
			ctx:   newContextWithPlayer(t, xid.New().String()),
			check: func(t *testing.T, err error) {
				require.NoError(t, err)
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newService(t)

			if tt.setup != nil {
				tt.setup(t, s.store)
			}

			_, err := s.StopQueue(tt.ctx, &emptypb.Empty{})
			tt.check(t, err)
		})
	}
}

func TestQueueUpdate(t *testing.T) {
	player := xid.New().String()
	ctx := newContextWithPlayer(t, player)

	tests := []struct {
		name     string
		ctx      context.Context
		expected *pb.QueueUpdate
		action   func(*testing.T, context.Context, *Service)
	}{
		{
			name: "expect queue started after start queue",
			ctx:  ctx,
			expected: &pb.QueueUpdate{
				Targets: []string{player},
				Update: &pb.QueueUpdate_Started{
					Started: &pb.QueueDetails{
						Gamemode: "test",
					},
				},
			},
			action: func(t *testing.T, ctx context.Context, s *Service) {
				_, err := s.StartQueue(ctx, &pb.StartQueueRequest{
					Gamemode: "test",
				})
				require.NoError(t, err, "StartQueue failed")
			},
		},
		{
			name: "expect queue stopped after stop queue",
			ctx:  ctx,
			expected: &pb.QueueUpdate{
				Targets: []string{player},
				Update: &pb.QueueUpdate_Stopped{
					Stopped: player,
				},
			},
			action: func(t *testing.T, ctx context.Context, s *Service) {
				// Queue needs to be started before stop update will be sent
				_, err := s.StartQueue(ctx, &pb.StartQueueRequest{
					Gamemode: "test",
				})
				require.NoError(t, err, "StartQueue failed")

				_, err = s.StopQueue(ctx, &emptypb.Empty{})
				require.NoError(t, err, "StopQueue failed")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newService(t)
			ctx, cancel := context.WithTimeout(tt.ctx, 10*time.Second)
			t.Cleanup(cancel)

			updates, close, err := s.broker.ConsumeQueueUpdates(ctx)
			require.NoError(t, err, "ConsumeQueueUpdates failed")
			t.Cleanup(func() {
				_ = close()
			})

			tt.action(t, ctx, s)

			for {
				select {
				case <-ctx.Done():
					t.Fatal("test timed out without receiving expected update")
				case update, ok := <-updates:
					require.True(t, ok, "update channel closed")
					if proto.Equal(update, tt.expected) {
						// received expected update
						return
					}
				}
			}
		})
	}
}

type contextTestKey string

func newContextWithPlayer(t *testing.T, playerId string) context.Context {
	ctx := context.WithValue(context.Background(), contextTestKey("testing.T"), t)
	return metadata.NewIncomingContext(ctx, metadata.Pairs("Player-Id", playerId))
}

func newService(t *testing.T) *Service {
	cfg := viper.New()
	_ = statestoreTesting.NewService(t, cfg)
	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

	// TODO: spin up minimatch in memory
	// cfg.Set("openmatch.frontend.hostname", "localhost")
	// cfg.Set("openmatch.frontend.port", 50499)
	newOMFrontend(t, cfg)

	srv := New(cfg)

	// override game cache for testing
	srv.gc = &games.GameDetailCache{
		Cacher: config.NewViewCacher(cfg, func(cfg config.View) (interface{}, func(), error) {
			return map[string]*ipb.GameDetails{
				"test": {
					Players: 1,
					Teams:   1,
				},
			}, nil, nil
		}),
	}

	return srv
}

func newOMFrontend(t *testing.T, cfg config.Mutable) {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	cfg.Set("openmatch.frontend.hostname", "localhost")
	cfg.Set("openmatch.frontend.port", port)

	s := grpc.NewServer()
	ompb.RegisterFrontendServiceServer(s, &stubOMFrontendService{})

	go func() {
		err := s.Serve(ln)
		if err != nil {
			t.Error(err)
		}
	}()

	t.Cleanup(s.Stop)
}

type stubOMFrontendService struct {
	ompb.UnimplementedFrontendServiceServer

	ts sync.Map // map of ticket id to pb.Ticket
}

func (s *stubOMFrontendService) CreateTicket(ctx context.Context, req *ompb.CreateTicketRequest) (*ompb.Ticket, error) {
	// Perform input validation.
	if req.Ticket == nil {
		return nil, status.Errorf(codes.InvalidArgument, ".ticket is required")
	}
	if req.Ticket.Assignment != nil {
		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with an assignment")
	}
	if req.Ticket.CreateTime != nil {
		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with create time set")
	}

	if req.Ticket.Id == "" {
		req.Ticket.Id = xid.New().String()
	}
	req.Ticket.CreateTime = timestamppb.Now()
	s.ts.Store(req.Ticket.Id, req.Ticket)
	return req.Ticket, nil
}

func (s *stubOMFrontendService) DeleteTicket(ctx context.Context, req *ompb.DeleteTicketRequest) (*emptypb.Empty, error) {
	_, ok := s.ts.LoadAndDelete(req.TicketId)
	if !ok {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	return &emptypb.Empty{}, nil
}

func (s *stubOMFrontendService) GetTicket(ctx context.Context, req *ompb.GetTicketRequest) (*ompb.Ticket, error) {
	item, ok := s.ts.Load(req.TicketId)
	if !ok {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	ticket, ok := item.(*ompb.Ticket)
	if !ok || ticket == nil {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	return ticket, nil
}
