package frontend

import (
	"context"
	"testing"
	"time"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/emptypb"

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
					Gamemode: "some gamemode",
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
					Gamemode: "some gamemode",
				},
			},
			check: func(t *testing.T, err error) {
				require.NoError(t, err)
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
					Gamemode: "some gamemode",
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
					Gamemode: "some gamemode",
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
	gamemode := "some gamemode"
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
						Gamemode: gamemode,
					},
				},
			},
			action: func(t *testing.T, ctx context.Context, s *Service) {
				_, err := s.StartQueue(ctx, &pb.StartQueueRequest{
					Gamemode: gamemode,
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
					Gamemode: gamemode,
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

	// TODO: spin up minimatch in memory
	cfg.Set("openmatch.frontend.hostname", "localhost")
	cfg.Set("openmatch.frontend.port", 50499)
	return New(cfg)
}
