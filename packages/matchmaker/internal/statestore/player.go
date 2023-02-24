package statestore

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/packages/matchmaker/internal/ipb"
)

func (rb *redisBackend) CreatePlayer(ctx context.Context, player *ipb.PlayerInternal) error {
	value, err := proto.Marshal(player)
	if err != nil {
		err = errors.Wrapf(err, "failed to marshal player proto, id %s", player.GetPlayerId())
		return status.Error(codes.Internal, err.Error())
	}

	if value == nil {
		return status.Errorf(codes.Internal, "failed to marshal player proto, marshal called with nil, id: %s", player.GetPlayerId())
	}

	err = rb.redisClient.Set(ctx, player.PlayerId, value, 0).Err()
	if err != nil {
		err = errors.Wrapf(err, "failed to set value for player %s", player.GetPlayerId())
		return status.Error(codes.Internal, err.Error())
	}

	return nil
}

func (rb *redisBackend) GetPlayer(ctx context.Context, id string) (*ipb.PlayerInternal, error) {
	value, err := rb.redisClient.Get(ctx, id).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, status.Errorf(codes.NotFound, "player %s not found", id)
		}

		err = errors.Wrapf(err, "failed to get player %s", id)
		return nil, status.Error(codes.Internal, err.Error())
	}

	if value == nil {
		return nil, status.Errorf(codes.NotFound, "player %s not found", id)
	}

	player := &ipb.PlayerInternal{}
	err = proto.Unmarshal(value, player)
	if err != nil {
		err = errors.Wrap(err, "failed to unmarshal player proto")
		return nil, status.Errorf(codes.Internal, err.Error())
	}

	return player, nil
}

func (rb *redisBackend) TrackTicket(ctx context.Context, id string, players []string) error {
	panic("not implemented") // TODO: Implement
}

func (rb *redisBackend) UntrackTicket(ctx context.Context, id string) error {
	panic("not implemented") // TODO: Implement
}

func (rb *redisBackend) TrackMatch(ctx context.Context, matchId string, players []string) error {
	panic("not implemented") // TODO: Implement
}

func (rb *redisBackend) UntrackMatch(ctx context.Context, id string) error {
	panic("not implemented") // TODO: Implement
}
