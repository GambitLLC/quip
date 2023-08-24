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
	StatusUpdateRoute Route = "status_update"
	QueueUpdateRoute  Route = "queue_update"
	MatchUpdateRoute  Route = "match_update"
)

type RedisBroker struct {
	redis *redis.Client
}

// NewRedisBroker constructs a new broker connecting to the redis address in cfg.
// Expects config with the following keys set:
// redis.hostname, redis.port
func NewRedisBroker(cfg config.View) *RedisBroker {
	client := redis.NewClient(
		&redis.Options{
			Addr: fmt.Sprintf("%s:%s", cfg.GetString("redis.hostname"), cfg.GetString("redis.port")),
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

func (b *RedisBroker) SubscribeStatusUpdate(ctx context.Context) *StatusSubscription {
	pubsub := b.redis.Subscribe(ctx, string(StatusUpdateRoute))
	ch := make(chan *pb.StatusUpdateMessage, 1)

	go func() {
		for msg := range pubsub.Channel() {
			update := &pb.StatusUpdateMessage{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				// logger.Error().Err(err).Msg("Unmarshal StatusUpdate failed")
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

func (b *RedisBroker) SubscribeQueueUpdate(ctx context.Context) *QueueSubscription {
	pubsub := b.redis.Subscribe(ctx, string(QueueUpdateRoute))
	ch := make(chan *pb.QueueUpdateMessage, 1)

	go func() {
		for msg := range pubsub.Channel() {
			update := &pb.QueueUpdateMessage{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				// logger.Error().Err(err).Msg("Unmarshal StatusUpdate failed")
				continue
			}

			ch <- update
		}
		close(ch)
	}()

	return &QueueSubscription{
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
				// logger.Error().Err(err).Msg("Unmarshal StatusUpdate failed")
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

type StatusSubscription struct {
	*redisSubscription
	ch chan *pb.StatusUpdateMessage
}

func (s *StatusSubscription) Channel() <-chan *pb.StatusUpdateMessage {
	return s.ch
}

type QueueSubscription struct {
	*redisSubscription
	ch chan *pb.QueueUpdateMessage
}

func (s *QueueSubscription) Channel() <-chan *pb.QueueUpdateMessage {
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
