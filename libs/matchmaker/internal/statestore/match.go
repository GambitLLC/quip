package statestore

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

func (rb *redisBackend) CreateMatch(ctx context.Context, match *ipb.MatchInternal) error {
	bs, err := proto.Marshal(match)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to marshal match: %s", err.Error())
	}

	if bs == nil {
		return status.Errorf(codes.Internal, "failed to marshal match proto, marshal called with nil")
	}

	err = rb.redisClient.Set(ctx, match.MatchId, bs, getMatchExpirationTime(rb.cfg)).Err()
	if err != nil {
		err = errors.Wrapf(err, "failed to set value for player %s", match.GetMatchId())
		return status.Error(codes.Internal, err.Error())
	}

	return nil
}

func (rb *redisBackend) GetMatch(ctx context.Context, id string) (*ipb.MatchInternal, error) {
	value, err := rb.redisClient.Get(ctx, id).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, status.Errorf(codes.NotFound, "match %s not found", id)
		}

		err = errors.Wrapf(err, "failed to get match %s", id)
		return nil, status.Error(codes.Internal, err.Error())
	}

	if value == nil {
		return nil, status.Errorf(codes.NotFound, "match %s not found", id)
	}

	match := &ipb.MatchInternal{}
	err = proto.Unmarshal(value, match)
	if err != nil {
		err = errors.Wrap(err, "failed to unmarshal match proto")
		return nil, status.Errorf(codes.Internal, err.Error())
	}

	return match, nil
}

func (rb *redisBackend) UpdateMatchState(ctx context.Context, id string, state ipb.MatchInternal_State) error {
	bs, err := rb.redisClient.Get(ctx, id).Bytes()
	if err != nil {
		if err == redis.Nil {
			return status.Errorf(codes.NotFound, "match %s not found", id)
		}

		err = errors.Wrapf(err, "failed to get match %s", id)
		return status.Error(codes.Internal, err.Error())
	}

	if bs == nil {
		return status.Errorf(codes.NotFound, "match %s not found", id)
	}

	match := &ipb.MatchInternal{}
	err = proto.Unmarshal(bs, match)
	if err != nil {
		err = errors.Wrap(err, "failed to unmarshal match proto")
		return status.Errorf(codes.Internal, err.Error())
	}

	match.State = state

	bs, err = proto.Marshal(match)
	if err != nil {
		return status.Errorf(codes.Internal, "failed to marshal match: %s", err.Error())
	}

	if bs == nil {
		return status.Errorf(codes.Internal, "failed to marshal match proto, marshal called with nil")
	}

	err = rb.redisClient.Set(ctx, id, bs, getMatchExpirationTime(rb.cfg)).Err()
	if err != nil {
		err = errors.Wrapf(err, "failed to set value for player %s", match.GetMatchId())
		return status.Error(codes.Internal, err.Error())
	}

	return nil
}

func getMatchExpirationTime(cfg config.View) time.Duration {
	const (
		name                            = "matchmaker.matchExpirationTime"
		defaultExpiration time.Duration = 15 * time.Minute
	)

	if !cfg.IsSet(name) {
		return defaultExpiration
	}

	return cfg.GetDuration(name)
}
