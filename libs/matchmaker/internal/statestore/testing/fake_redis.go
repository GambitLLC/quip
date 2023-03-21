package testing

import (
	"testing"

	"github.com/alicebob/miniredis/v2"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
)

func NewService(t *testing.T, cfg config.Mutable) statestore.Service {
	mredis := miniredis.NewMiniRedis()
	err := mredis.StartAddr("localhost:0")
	if err != nil {
		t.Fatalf("failed to start miniredis, %v", err)
	}
	t.Cleanup(mredis.Close)

	cfg.Set("matchmaker.redis.hostname", mredis.Host())
	cfg.Set("matchmaker.redis.port", mredis.Port())

	return statestore.New(cfg)
}
