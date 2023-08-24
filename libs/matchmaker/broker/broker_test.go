package broker_test

import (
	"testing"
	"time"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/matchmaker/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestStatusUpdate(t *testing.T) {
	ctx := test.NewContext(t)
	rb := newRedisBroker(t)
	sub := rb.SubscribeStatusUpdate(ctx)
	t.Cleanup(func() {
		require.NoError(t, sub.Close(), "StatusSubscription.Close failed")
	})

	msg := &pb.StatusUpdateMessage{
		Targets: []string{"target"},
		Update: &pb.Status{
			State: pb.PlayerState_PLAYER_STATE_PLAYING,
		},
	}

	err := rb.Publish(ctx, broker.StatusUpdateRoute, msg)
	require.NoError(t, err, "RedisBroker.Publish failed")

	select {
	case rcvdMsg, ok := <-sub.Channel():
		require.True(t, ok, "StatusSubscription.Channel closed")
		equal := proto.Equal(rcvdMsg, msg)
		require.True(t, equal, "received msg does not equal published msg")

	case <-time.After(5 * time.Second):
		t.Fatal("test timed out: did not receive status update message")
	}
}

func newRedisBroker(t *testing.T) *broker.RedisBroker {
	cfg := viper.New()
	test.NewRedis(t, cfg)

	rb := broker.NewRedisBroker(cfg)
	t.Cleanup(func() {
		require.NoError(t, rb.Close(), "RedisBroker.Close failed")
	})

	return rb
}
