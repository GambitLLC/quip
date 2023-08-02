package statestore

import (
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/pkg/errors"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

func (rb *redisBackend) CreatePlayer(ctx context.Context, player *ipb.PlayerDetails) error {
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

func (rb *redisBackend) GetPlayer(ctx context.Context, id string) (*ipb.PlayerDetails, error) {
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

	player := &ipb.PlayerDetails{}
	err = proto.Unmarshal(value, player)
	if err != nil {
		err = errors.Wrap(err, "failed to unmarshal player proto")
		return nil, status.Errorf(codes.Internal, err.Error())
	}

	return player, nil
}

func (rb *redisBackend) TrackTicket(ctx context.Context, id string, playerIds []string) error {
	return rb.modifyPlayers(ctx, playerIds, func(player *ipb.PlayerDetails) {
		player.TicketId = &id
	})
}

func (rb *redisBackend) UntrackTicket(ctx context.Context, playerIds []string) error {
	return rb.modifyPlayers(ctx, playerIds, func(player *ipb.PlayerDetails) {
		player.TicketId = nil
	})
}

func (rb *redisBackend) TrackMatch(ctx context.Context, matchId string, playerIds []string) error {
	return rb.modifyPlayers(ctx, playerIds, func(player *ipb.PlayerDetails) {
		player.MatchId = &matchId
	})
}

func (rb *redisBackend) UntrackMatch(ctx context.Context, playerIds []string) error {
	return rb.modifyPlayers(ctx, playerIds, func(player *ipb.PlayerDetails) {
		player.MatchId = nil
	})
}

func (rb *redisBackend) modifyPlayers(ctx context.Context, playerIds []string, modify func(*ipb.PlayerDetails)) error {
	res, err := rb.redisClient.MGet(ctx, playerIds...).Result()
	if err != nil {
		err = errors.Wrap(err, "failed to get players")
		return status.Error(codes.Internal, err.Error())
	}

	players := make([]*ipb.PlayerDetails, 0, len(res))
	for _, val := range res {
		if val == nil {
			// TODO: just create empty PlayerInternal struct for players that were not found
			continue
		}

		sval, ok := val.(string)
		if !ok {
			return status.Errorf(codes.Internal, "player value is not type []byte, is %T", val)
		}

		player := &ipb.PlayerDetails{}
		err = proto.Unmarshal([]byte(sval), player)
		if err != nil {
			err = errors.Wrap(err, "failed to unmarshal player proto")
			return status.Error(codes.Internal, err.Error())
		}

		players = append(players, player)
	}

	pipe := rb.redisClient.TxPipeline()
	for _, player := range players {
		modify(player)

		val, err := proto.Marshal(player)
		if err != nil {
			return status.Errorf(codes.Internal, "failed to marshal player: %s", err.Error())
		}

		err = pipe.Set(ctx, player.PlayerId, val, 0).Err()
		if err != nil {
			return errors.Wrap(err, "failed to send player set command")
		}
	}

	_, err = pipe.Exec(ctx)
	if err != nil {
		err = errors.Wrap(err, "failed to exec pipeline")
		return status.Error(codes.Internal, err.Error())
	}

	return nil
}
