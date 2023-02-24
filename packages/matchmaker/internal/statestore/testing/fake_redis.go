package testing

import (
	"testing"

	"github.com/alicebob/miniredis/v2"

	"github.com/GambitLLC/quip/packages/config"
	"github.com/GambitLLC/quip/packages/matchmaker/internal/statestore"
)

func NewService(t *testing.T, cfg config.Mutable) statestore.Service {
	mredis := miniredis.NewMiniRedis()
	err := mredis.StartAddr("localhost:0")
	if err != nil {
		t.Fatalf("failed to start miniredis, %v", err)
	}
	t.Cleanup(mredis.Close)

	cfg.Set("redis.hostname", mredis.Host())
	cfg.Set("redis.port", mredis.Port())

	return statestore.New(cfg)
}
