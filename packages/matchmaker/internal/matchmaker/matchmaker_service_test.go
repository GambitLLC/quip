package matchmaker

import (
	"context"
	"testing"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/emptypb"

	"github.com/GambitLLC/quip/packages/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/packages/matchmaker/internal/statestore"
	statestoreTesting "github.com/GambitLLC/quip/packages/matchmaker/internal/statestore/testing"
	"github.com/GambitLLC/quip/packages/matchmaker/pb"
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
	tests := []struct {
		name  string
		setup func(*testing.T, statestore.Service)
		ctx   context.Context
		check func(*testing.T, *pb.StatusResponse, error)
	}{
		{
			name:  "expect IDLE status",
			setup: nil,
			ctx:   newContextWithPlayer(t, xid.New().String()),
			check: func(t *testing.T, sr *pb.StatusResponse, err error) {
				require.NoError(t, err)
				require.Equal(t, pb.StatusResponse_IDLE, sr.Status, "expected status to be IDLE")
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

func TestStartQueue(t *testing.T) {
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

type contextTestKey string

func newContextWithPlayer(t *testing.T, playerId string) context.Context {
	ctx := context.WithValue(context.Background(), contextTestKey("testing.T"), t)
	return metadata.NewIncomingContext(ctx, metadata.Pairs("Player-Id", playerId))
}

func newService(t *testing.T) *Service {
	cfg := viper.New()
	store := statestoreTesting.NewService(t, cfg)
	return &Service{
		store: store,
	}
}
