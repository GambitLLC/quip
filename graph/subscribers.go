package graph

import (
	"context"
	"errors"
	"sync"

	"github.com/GambitLLC/quip/graph/model"
	"github.com/GambitLLC/quip/libs/broker"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/rs/zerolog"
)

type Subscription struct {
	ch chan *model.StatusUpdate

	// used a closed (dirty) flag to lazily clean up subscriptions
	closed bool
}

type SubscriptionManager struct {
	logger zerolog.Logger
	broker broker.Client

	// TODO: switch to sync.Map?
	lock sync.RWMutex

	// channels is a map of targets to map of id to subscription
	channels map[string]map[string]*Subscription

	// subscribers is a map of subscriber id to subscription
	subscribers map[string]*Subscription
}

func NewSubscriptionManager(cfg config.View, logger zerolog.Logger) (*SubscriptionManager, error) {
	brokerClient := broker.NewRedis(cfg)
	updates, _, err := brokerClient.ConsumeStatusUpdate(context.Background())
	if err != nil {
		return nil, err
	}

	manager := &SubscriptionManager{
		logger:      logger,
		broker:      brokerClient,
		channels:    make(map[string]map[string]*Subscription),
		subscribers: make(map[string]*Subscription),
	}

	go func() {
		for {
			update, ok := <-updates
			if !ok {
				logger.Info().Msg("status update channel closed")
				return
			}

			manager.lock.RLock()
			for _, target := range update.GetTargets() {
				for id, sub := range manager.channels[target] {
					if sub.closed {
						delete(manager.channels[target], id)
						return
					}

					// TODO: should blocked channels just be skipped or should a waitgroup be made?
					select {
					case sub.ch <- &model.StatusUpdate{StatusUpdate: update}:
					default:
						logger.Warn().Str("id", id).Msg("subscriber channel blocked")
					}
				}
			}

			manager.lock.RUnlock()
		}
	}()

	return manager, nil
}

func (sm *SubscriptionManager) Close() error {
	return sm.broker.Close()
}

// Subscribe returns a channel that sends status updates for any targets subscribed to, including
// previous calls to subscribe with the same id. The id provided should be an id based on the
// websocket connection.
func (sm *SubscriptionManager) Subscribe(id string, targets []string) (<-chan *model.StatusUpdate, error) {
	if len(targets) == 0 {
		return nil, errors.New("targets must be non-empty")
	}

	sm.lock.Lock()
	defer sm.lock.Unlock()

	sub, exists := sm.subscribers[id]
	if !exists {
		sub = &Subscription{
			ch: make(chan *model.StatusUpdate, 1),
		}
		sm.subscribers[id] = sub
	}

	for _, target := range targets {
		if sm.channels[target] == nil {
			sm.channels[target] = make(map[string]*Subscription)
		}
		sm.channels[target][id] = sub
	}

	return sub.ch, nil
}

// Unsubscribe closes any subscriptions associated with id.
func (sm *SubscriptionManager) Unsubscribe(id string) {
	sm.lock.Lock()
	defer sm.lock.Unlock()

	sub := sm.subscribers[id]
	if sub == nil || sub.closed {
		return
	}

	sub.closed = true
	close(sub.ch)
	delete(sm.subscribers, id)
}
