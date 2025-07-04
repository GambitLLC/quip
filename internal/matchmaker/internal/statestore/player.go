package statestore

import (
	"context"
	"fmt"
)

const (
	ticketIdFmt string = "tid:%s"
	matchIdFmt  string = "mid:%s"
)

// GetPlayer returns the ticket id tid and match id mid for a given player.
func (rb *redisBackend) GetPlayer(ctx context.Context, id string) (tid string, mid string, err error) {
	resps, err := rb.redisClient.MGet(ctx, fmt.Sprintf(ticketIdFmt, id), fmt.Sprintf(matchIdFmt, id)).Result()
	if err != nil {
		return "", "", err
	}

	// type assert but ignore failures (nil resp just means key didn't exist)
	tid, _ = resps[0].(string)
	mid, _ = resps[1].(string)
	return
}

func (rb *redisBackend) SetTicketId(ctx context.Context, id string, players []string) (bool, error) {
	vals := make([]string, 2*len(players))
	for i, player := range players {
		vals[2*i] = fmt.Sprintf(ticketIdFmt, player)
		vals[2*i+1] = id
	}

	return rb.redisClient.MSetNX(ctx, vals).Result()
}

func (rb *redisBackend) UnsetTicketId(ctx context.Context, players []string) error {
	keys := make([]string, len(players))
	for i, player := range players {
		keys[i] = fmt.Sprintf(ticketIdFmt, player)
	}

	return rb.redisClient.Del(ctx, keys...).Err()
}

func (rb *redisBackend) SetMatchId(ctx context.Context, id string, players []string) (bool, error) {
	vals := make([]string, 2*len(players))
	for i, player := range players {
		vals[2*i] = fmt.Sprintf(matchIdFmt, player)
		vals[2*i+1] = id
	}

	return rb.redisClient.MSetNX(ctx, vals).Result()
}

func (rb *redisBackend) UnsetMatchId(ctx context.Context, players []string) error {
	keys := make([]string, len(players))
	for i, player := range players {
		keys[i] = fmt.Sprintf(matchIdFmt, player)
	}

	return rb.redisClient.Del(ctx, keys...).Err()
}

func (rb *redisBackend) GetTicketIds(ctx context.Context, players []string) ([]string, error) {
	keys := make([]string, len(players))
	for i, player := range players {
		keys[i] = fmt.Sprintf(ticketIdFmt, player)
	}

	vals, err := rb.redisClient.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, err
	}

	ret := make([]string, len(vals))
	for i, val := range vals {
		// type assert value into string -- wrong types just default to empty string
		ret[i], _ = val.(string)
	}

	return ret, nil
}
