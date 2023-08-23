package broker

import pb "github.com/GambitLLC/quip/libs/pb/matchmaker"

type redisSubscription struct {
}

func (s *redisSubscription) Close() error {
	panic("not yet implemented")
}

type StatusSubscription struct {
	*redisSubscription
}

func (s *StatusSubscription) Channel() <-chan *pb.StatusUpdateMessage {
	panic("not yet implemented")
}

type QueueSubscription struct {
	*redisSubscription
}

func (s *QueueSubscription) Channel() <-chan *pb.QueueUpdateMessage {
	panic("not yet implemented")
}

type MatchSubscription struct {
	*redisSubscription
}

func (s *MatchSubscription) Channel() <-chan *pb.MatchUpdateMessage {
	panic("not yet implemented")
}
