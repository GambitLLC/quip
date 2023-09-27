package statestore

import (
	"context"

	"github.com/GambitLLC/quip/libs/config"
)

// Service is an interface for talking to a storage backend.
type Service interface {
	// Closes the connection to the underlying storage.
	Close() error

	// Mutex

	// NewMutex returns a Locker with the given name.
	NewMutex(key string) Locker

	// Player

	// GetPlayer returns the ticket id tid and match id mid for a given player.
	GetPlayer(ctx context.Context, id string) (tid, mid string, err error)

	SetTicketId(ctx context.Context, id string, players []string) (bool, error)

	UnsetTicketId(ctx context.Context, players []string) error

	SetMatchId(ctx context.Context, id string, players []string) (bool, error)

	UnsetMatchId(ctx context.Context, players []string) error

	// Batch

	GetTicketIds(ctx context.Context, players []string) ([]string, error)
}

func New(cfg config.View) Service {
	return NewRedis(cfg)
}

// Locker provides methods to use distributed locks against the storage backend.
type Locker interface {
	Lock(context.Context) error
	Unlock(context.Context) (bool, error)
}
