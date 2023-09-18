package broker

import (
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type Route string

const (
	StateUpdateRoute  Route = "state_update"
	StatusUpdateRoute Route = "status_update"
	MatchUpdateRoute  Route = "match_update"
)

type RedisBroker struct {
	redis *redis.Client
}

// NewRedisBroker constructs a new broker connecting to the redis address in cfg.
// Redis address should be set under keys 'matchmaker.redis.hostname' and 'matchmaker.redis.port'
// redis.hostname, redis.port
func NewRedisBroker(cfg config.View) *RedisBroker {
	client := redis.NewClient(
		&redis.Options{
			Addr: fmt.Sprintf("%s:%s", cfg.GetString("matchmaker.redis.hostname"), cfg.GetString("matchmaker.redis.port")),
		},
	)

	return &RedisBroker{
		redis: client,
	}
}

func (b *RedisBroker) Close() error {
	return b.redis.Close()
}

func (b *RedisBroker) Publish(ctx context.Context, route Route, msg proto.Message) error {
	bs, err := proto.Marshal(msg)
	if err != nil {
		return err
	}

	return b.redis.Publish(ctx, string(route), bs).Err()
}

func (b *RedisBroker) SubscribeStateUpdate(ctx context.Context) *StateSubscription {
	pubsub := b.redis.Subscribe(ctx, string(StateUpdateRoute))
	ch := make(chan *pb.StateUpdateMessage, 1)

	go func() {
		for msg := range pubsub.Channel() {
			update := &pb.StateUpdateMessage{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				// logger.Error().Err(err).Msg("Unmarshal StateUpdate failed")
				continue
			}

			ch <- update
		}
		close(ch)
	}()

	return &StateSubscription{
		redisSubscription: &redisSubscription{
			pubsub: pubsub,
		},
		ch: ch,
	}
}

func (b *RedisBroker) SubscribeStatusUpdate(ctx context.Context) *StatusSubscription {
	pubsub := b.redis.Subscribe(ctx, string(StatusUpdateRoute))
	ch := make(chan *pb.StatusUpdateMessage, 1)

	go func() {
		for msg := range pubsub.Channel() {
			update := &pb.StatusUpdateMessage{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				// logger.Error().Err(err).Msg("Unmarshal StateUpdate failed")
				continue
			}

			ch <- update
		}
		close(ch)
	}()

	return &StatusSubscription{
		redisSubscription: &redisSubscription{
			pubsub: pubsub,
		},
		ch: ch,
	}
}

// TODO: MatchUpdates should probably be on RabbitMQ or Kafka, not redis
func (b *RedisBroker) SubscribeMatchUpdate(ctx context.Context) *MatchSubscription {
	pubsub := b.redis.Subscribe(ctx, string(MatchUpdateRoute))
	ch := make(chan *pb.MatchUpdateMessage, 1)

	go func() {
		for msg := range pubsub.Channel() {
			update := &pb.MatchUpdateMessage{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				// logger.Error().Err(err).Msg("Unmarshal StateUpdate failed")
				continue
			}

			ch <- update
		}
		close(ch)
	}()

	return &MatchSubscription{
		redisSubscription: &redisSubscription{
			pubsub: pubsub,
		},
		ch: ch,
	}
}

// subscription objects are created if for some reason multiple subscribers are needed
// or subscription needs to be closed.
type redisSubscription struct {
	pubsub *redis.PubSub
}

func (s *redisSubscription) Close() error {
	return s.pubsub.Close()
}

type StateSubscription struct {
	*redisSubscription
	ch chan *pb.StateUpdateMessage
}

func (s *StateSubscription) Channel() <-chan *pb.StateUpdateMessage {
	return s.ch
}

type StatusSubscription struct {
	*redisSubscription
	ch chan *pb.StatusUpdateMessage
}

func (s *StatusSubscription) Channel() <-chan *pb.StatusUpdateMessage {
	return s.ch
}

// TODO: MatchSubscription should probably be on either rabbitmq or kafka, not redis
type MatchSubscription struct {
	*redisSubscription
	ch chan *pb.MatchUpdateMessage
}

func (s *MatchSubscription) Channel() <-chan *pb.MatchUpdateMessage {
	return s.ch
}
