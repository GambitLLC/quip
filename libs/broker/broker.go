package broker

import (
	"context"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

const (
	StatusUpdateRoute string = "status_update"
)

// Client is an interface to talk to some messaging system.
type Client interface {
	// Closes the connection.
	Close() error

	// Publish status update to all consumers.
	PublishStatusUpdate(context.Context, *pb.StatusUpdate) error

	// Consume status updates. Returns channel and a close function.
	ConsumeStatusUpdate(context.Context) (<-chan *pb.StatusUpdate, func() error, error)
}
