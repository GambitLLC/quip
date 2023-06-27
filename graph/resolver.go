package graph

import (
	"os"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
	"github.com/rs/zerolog"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	logger zerolog.Logger

	// TODO: add database connection / rpc clients
	frontend matchmaker.FrontendClient

	*SubscriptionManager
}

func NewResolver(cfg config.View) (*Resolver, error) {
	frontendConn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend")
	if err != nil {
		return nil, err
	}

	logger := zerolog.New(os.Stderr).With().Str("component", "graph.resolver").Logger()

	sm, err := NewSubscriptionManager(cfg, logger)
	if err != nil {
		return nil, err
	}

	resolver := &Resolver{
		logger:              logger,
		frontend:            matchmaker.NewFrontendClient(frontendConn),
		SubscriptionManager: sm,
	}

	return resolver, nil
}

func (r *Resolver) Close() error {
	return r.broker.Close()
}
