package matchmaker

import (
	"context"
	"testing"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/types/known/emptypb"

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
			cfg := viper.New()
			store := statestoreTesting.NewService(t, cfg)
			s := &Service{
				store: store,
			}

			if tt.setup != nil {
				tt.setup(t, store)
			}

			got, err := s.GetStatus(tt.ctx, &emptypb.Empty{})
			tt.check(t, got, err)
		})
	}
}

func TestStartQueue(t *testing.T) {
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
		// TODO: add test cases
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var store statestore.Service
			s := &Service{
				store: store,
			}

			if tt.setup != nil {
				tt.setup(t, store)
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
		// TODO: add test cases
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var store statestore.Service
			s := &Service{
				store: store,
			}

			if tt.setup != nil {
				tt.setup(t, store)
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
