package graph

import (
	"github.com/GambitLLC/quip/libs/config"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	// TODO: add database connection / rpc clients
}

func NewResolver(cfg config.View) *Resolver {
	return &Resolver{}
}
