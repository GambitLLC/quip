package statestore

import (
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
	rs "github.com/go-redsync/redsync/v4"
	rsgoredis "github.com/go-redsync/redsync/v4/redis/goredis/v8"

	"github.com/GambitLLC/quip/internal/config"
)

type redisBackend struct {
	cfg         config.View
	redisClient *redis.Client
	redsync     *rs.Redsync
}

func NewRedis(cfg config.View) *redisBackend {
	client := redis.NewClient(
		&redis.Options{
			Addr: fmt.Sprintf("%s:%s", cfg.GetString("matchmaker.redis.hostname"), cfg.GetString("matchmaker.redis.port")),
		},
	)
	redsync := rs.New(rsgoredis.NewPool(client))
	return &redisBackend{
		cfg:         cfg,
		redisClient: client,
		redsync:     redsync,
	}
}

func (rb *redisBackend) Close() error {
	return rb.redisClient.Close()
}

func (rb *redisBackend) NewMutex(key string) Locker {
	return redisLocker{
		m: rb.redsync.NewMutex(fmt.Sprintf("lock:%s", key)),
	}
}

type redisLocker struct {
	m *rs.Mutex
}

func (rl redisLocker) Lock(ctx context.Context) error {
	return rl.m.LockContext(ctx)
}

func (rl redisLocker) Unlock(ctx context.Context) (bool, error) {
	return rl.m.UnlockContext(ctx)
}
