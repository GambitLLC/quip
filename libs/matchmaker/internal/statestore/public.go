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

	CreatePlayer(ctx context.Context, player *ipb.PlayerDetails) error

	GetPlayer(ctx context.Context, id string) (*ipb.PlayerDetails, error)

	TrackTicket(ctx context.Context, id string, playerIds []string) error

	UntrackTicket(ctx context.Context, playerIds []string) error

	TrackMatch(ctx context.Context, matchId string, playerIds []string) error

	UntrackMatch(ctx context.Context, playerIds []string) error

	// Matches

	CreateMatch(ctx context.Context, match *ipb.MatchDetails) error

	GetMatch(ctx context.Context, id string) (*ipb.MatchDetails, error)

	DeleteMatch(ctx context.Context, id string) error
}

func New(cfg config.View) Service {
	return NewRedis(cfg)
}

// Locker provides methods to use distributed locks against the storage backend.
type Locker interface {
	Lock(context.Context) error
	Unlock(context.Context) (bool, error)
}
