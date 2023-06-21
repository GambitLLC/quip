package graph

import (
	"context"
	"log"
	"sync"

	"github.com/GambitLLC/quip/graph/model"
	"github.com/GambitLLC/quip/libs/broker"
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

	broker   broker.Client
	subsLock sync.RWMutex
	subs     map[string][]chan *model.Status
}

func NewResolver(cfg config.View) (*Resolver, error) {
	frontendConn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.frontend")
	if err != nil {
		return nil, err
	}

	brokerClient := broker.NewRedis(cfg)
	updates, _, err := brokerClient.ConsumeStatusUpdate(context.Background())
	if err != nil {
		return nil, err
	}

	resolver := &Resolver{
		frontend: matchmaker.NewFrontendClient(frontendConn),
		broker:   brokerClient,
		subs:     make(map[string][]chan *model.Status),
	}

	go func() {
		for {
			update := <-updates
			resolver.subsLock.RLock()
			for _, target := range update.Targets {
				for _, sub := range resolver.subs[target] {
					select {
					case sub <- &model.Status{Status: update.Status}:
					default:
						log.Printf("CHANNEL for %s BLOCKED", target)
					}

				}
			}

		}
	}()

	return resolver, nil
}

func (r *Resolver) trackStatus(id string) (chan *model.Status, error) {
	r.subsLock.Lock()
	defer r.subsLock.Unlock()

	ch := make(chan *model.Status, 1)
	r.subs[id] = append(r.subs[id], ch)

	return ch, nil
}

func (r *Resolver) Close() error {
	return r.broker.Close()
}
