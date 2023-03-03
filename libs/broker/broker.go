package broker

import (
	"context"

	"github.com/GambitLLC/quip/libs/pb"
)

const (
	QueueUpdateRoute  string = "queue_update"
	StatusUpdateRoute string = "status_update"
)

// Client is an interface to talk to some messaging system.
type Client interface {
	// Closes the connection.
	Close() error

	// Publish a queue update to all consumers.
	PublishQueueUpdate(context.Context, *pb.QueueUpdate) error

	// Consume queue updates. Returns channel and a close function.
	ConsumeQueueUpdates(context.Context) (<-chan *pb.QueueUpdate, func() error, error)

	// Publish status update to all consumers.
	PublishStatusUpdate(context.Context, *pb.StatusUpdate) error

	// Consume status updates. Returns channel and a close function.
	ConsumeStatusUpdate(context.Context) (<-chan *pb.StatusUpdate, func() error, error)
}
