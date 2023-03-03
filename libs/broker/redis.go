package broker

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/proto"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/pb"
)

type redisBroker struct {
	cfg         config.View
	redisClient *redis.Client
}

func NewRedis(cfg config.View) *redisBroker {
	client := redis.NewClient(
		&redis.Options{
			Addr: fmt.Sprintf("%s:%s", cfg.GetString("redis.hostname"), cfg.GetString("redis.port")),
		},
	)

	return &redisBroker{
		cfg:         cfg,
		redisClient: client,
	}
}

// Closes the connection.
func (rb *redisBroker) Close() error {
	return rb.redisClient.Close()
}

// Publish a queue update to all consumers.
func (rb *redisBroker) PublishQueueUpdate(ctx context.Context, update *pb.QueueUpdate) error {
	bs, err := proto.Marshal(update)
	if err != nil {
		return errors.Wrap(err, "marshal QueueUpdate failed")
	}

	return rb.redisClient.Publish(ctx, QueueUpdateRoute, bs).Err()
}

// Consume queue updates. Returns channel and a close function.
func (rb *redisBroker) ConsumeQueueUpdates(ctx context.Context) (<-chan *pb.QueueUpdate, func() error, error) {
	sub := rb.redisClient.Subscribe(ctx, QueueUpdateRoute)
	updates := make(chan *pb.QueueUpdate, 3) // TODO: consume options

	go func() {
		for msg := range sub.Channel() {
			update := &pb.QueueUpdate{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				log.Printf("unmarshal msg as QueueUpdate failed: %v", err)
				continue
			}

			updates <- update
		}
		close(updates)
	}()

	return updates, sub.Close, nil
}

// Publish status update to all consumers.
func (rb *redisBroker) PublishStatusUpdate(ctx context.Context, update *pb.StatusUpdate) error {
	bs, err := proto.Marshal(update)
	if err != nil {
		return errors.Wrap(err, "marshal StatusUpdate failed")
	}

	return rb.redisClient.Publish(ctx, StatusUpdateRoute, bs).Err()
}

// Consume status updates. Returns channel and a close function.
func (rb *redisBroker) ConsumeStatusUpdate(ctx context.Context) (<-chan *pb.StatusUpdate, func() error, error) {
	sub := rb.redisClient.Subscribe(ctx, StatusUpdateRoute)
	updates := make(chan *pb.StatusUpdate, 3) // TODO: consume options

	go func() {
		for msg := range sub.Channel() {
			update := &pb.StatusUpdate{}
			if err := proto.Unmarshal([]byte(msg.Payload), update); err != nil {
				log.Printf("unmarshal msg as StatusUpdate failed: %v", err)
				continue
			}

			updates <- update
		}
		close(updates)
	}()

	return updates, sub.Close, nil
}
