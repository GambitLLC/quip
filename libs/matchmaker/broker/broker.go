package broker

import (
	"context"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type Client interface {
	PublishStatusUpdate(context.Context, *pb.StatusUpdateMessage) error
	PublishQueueUpdate(context.Context, *pb.QueueUpdateMessage) error
	PublishMatchUpdate(context.Context, *pb.MatchUpdateMessage) error

	SubscribeStatusUpdate(context.Context) *StatusSubscription
	SubscribeQueueUpdate(context.Context) *QueueSubscription
	SubscribeMatchUpdate(context.Context) *MatchSubscription

	Close() error
}
