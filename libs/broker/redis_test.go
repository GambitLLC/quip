package broker

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestStatusUpdate(t *testing.T) {
	cfg := newConfig(t)
	client := NewRedis(cfg)

	ctx, cancel := context.WithTimeout(newContext(t), 10*time.Second)
	defer cancel()

	updates, close, err := client.ConsumeStatusUpdate(ctx)
	require.NoError(t, err, "ConsumeStatusUpdate failed")
	t.Cleanup(func() {
		err := close()
		require.NoError(t, err, "close failed")
	})

	msg := &pb.StatusUpdate{
		Targets: []string{xid.New().String()},
		Status: &pb.Status{
			State: pb.State_STATE_PLAYING,
		},
	}
	err = client.PublishStatusUpdate(ctx, msg)
	require.NoError(t, err, "PublishStatusUpdate failed")

	for {
		select {
		case <-ctx.Done():
			t.Fatal("test timed out without receiving published update")
		case update, ok := <-updates:
			require.True(t, ok, "update channel closed")
			if proto.Equal(update, msg) {
				// received published message, done
				return
			}
		}
	}
}

type contextTestKey string

func newContext(t *testing.T) context.Context {
	return context.WithValue(context.Background(), contextTestKey("testing.T"), t)
}

func newConfig(t *testing.T) config.Mutable {
	cfg := viper.New()
	mredis := miniredis.NewMiniRedis()
	err := mredis.StartAddr("localhost:0")
	if err != nil {
		t.Fatalf("failed to start miniredis, %v", err)
	}
	t.Cleanup(mredis.Close)

	cfg.Set("broker.hostname", mredis.Host())
	cfg.Set("broker.port", mredis.Port())

	return cfg
}
