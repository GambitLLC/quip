package statestore

import (
	"context"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

// Service is an interface for talking to a storage backend.
type Service interface {
	// Closes the connection to the underlying storage.
	Close() error

	// Mutex

	// NewMutex returns a Locker with the given name.
	NewMutex(key string) Locker

	// Player

	CreatePlayer(ctx context.Context, player *ipb.PlayerInternal) error

	GetPlayer(ctx context.Context, id string) (*ipb.PlayerInternal, error)

	TrackTicket(ctx context.Context, id string, playerIds []string) error

	UntrackTicket(ctx context.Context, playerIds []string) error

	TrackMatch(ctx context.Context, matchId string, playerIds []string) error

	UntrackMatch(ctx context.Context, playerIds []string) error

	// Matches

	CreateMatch(ctx context.Context, match *ipb.MatchInternal) error

	GetMatch(ctx context.Context, id string) (*ipb.MatchInternal, error)

	UpdateMatchState(ctx context.Context, id string, state ipb.MatchInternal_State) error
}

func New(cfg config.View) Service {
	return NewRedis(cfg)
}

// Locker provides methods to use distributed locks against the storage backend.
type Locker interface {
	Lock(context.Context) error
	Unlock(context.Context) (bool, error)
}
