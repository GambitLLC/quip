package test

import (
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/internal/config"
)

func NewRedis(t *testing.T, cfg config.Mutable) {
	mredis := miniredis.NewMiniRedis()
	err := mredis.StartAddr("localhost:0")
	require.NoError(t, err, "NewRedis failed")

	t.Cleanup(mredis.Close)

	cfg.Set("matchmaker.redis.hostname", "localhost")
	cfg.Set("matchmaker.redis.port", mredis.Port())
}
