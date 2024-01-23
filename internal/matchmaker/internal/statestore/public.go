package statestore

import (
	"context"

	"github.com/GambitLLC/quip/internal/config"
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

	GetTicketIds(ctx context.Context, players []string) ([]string, error)

	// Match

	CreateMatch(ctx context.Context, id string, players []string, connection string) error

	GetMatchConnection(ctx context.Context, id string) (string, error)

	GetMatchPlayers(ctx context.Context, id string) ([]string, error)

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

type MatchState uint8

const (
	MatchStatePending MatchState = iota
	MatchStateStarted
	// No MatchState for cancelled or finished -- should be removed from statestore
)
