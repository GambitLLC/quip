package statestore

import (
	"context"

	"github.com/GambitLLC/quip/packages/matchmaker/internal/ipb"
)

func (rb *redisBackend) CreatePlayer(ctx context.Context, player *ipb.PlayerInternal) error {
	panic("not implemented") // TODO: Implement
}

func (rb *redisBackend) GetPlayer(ctx context.Context, id string) (*ipb.PlayerInternal, error) {
	panic("not implemented") // TODO: Implement
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
