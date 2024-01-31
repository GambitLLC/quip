package statestore

import (
	"context"
	"fmt"
)

const (
	matchPlayersFmt     string = "players:%s"
	matchConnectionsFmt string = "connection:%s"
)

func (rb *redisBackend) CreateMatch(ctx context.Context, id string, players []string, connection string) error {
	pipe := rb.redisClient.Pipeline()
	pipe.SAdd(ctx, fmt.Sprintf(matchPlayersFmt, id), players)
	pipe.Set(ctx, fmt.Sprintf(matchConnectionsFmt, id), connection, 0)
	_, err := pipe.Exec(ctx)
	return err
}

func (rb *redisBackend) GetMatchConnection(ctx context.Context, id string) (string, error) {
	return rb.redisClient.Get(ctx, fmt.Sprintf(matchConnectionsFmt, id)).Result()
}

func (rb *redisBackend) GetMatchPlayers(ctx context.Context, id string) ([]string, error) {
	return rb.redisClient.SMembers(ctx, fmt.Sprintf(matchPlayersFmt, id)).Result()
}

func (rb *redisBackend) DeleteMatch(ctx context.Context, id string) error {
	return rb.redisClient.Del(
		ctx,
		fmt.Sprintf(matchPlayersFmt, id),
		fmt.Sprintf(matchConnectionsFmt, id),
	).Err()
}
