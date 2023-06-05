package graph

import (
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	// TODO: add database connection / rpc clients
	frontend matchmaker.FrontendClient
}

func NewResolver(cfg config.View) (*Resolver, error) {
	frontendConn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend")
	if err != nil {
		return nil, err
	}
	return &Resolver{
		frontend: matchmaker.NewFrontendClient(frontendConn),
	}, nil
}
