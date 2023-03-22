package frontend

import (
	"context"
	"fmt"

	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/rpc"
)

type gameCache struct {
	cacher config.Cacher
}

type gameCacheItem map[string]map[string]interface{}

func newGameCache() *gameCache {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		games, ok := cfg.Get("games").(map[string]interface{})
		if !ok {
			return nil, nil, errors.New("failed to read 'games' from config")
		}

		transformed := make(gameCacheItem, len(games))

		for k, v := range games {
			game, ok := v.(map[string]interface{})
			if !ok {
				return nil, nil, errors.Errorf("failed to read 'games.%s' from config, data is malformed", k)
			}

			transformed[k] = game
		}

		return transformed, nil, nil
	}

	return &gameCache{
		cacher: config.NewFileCacher("games", newInstance),
	}
}

// GameDetails returns the configuration for the specified game or nil if not found.
func (gc *gameCache) GameDetails(name string) (map[string]interface{}, error) {
	games, err := gc.cacher.Get()
	if err != nil {
		return nil, err
	}

	return games.(gameCacheItem)[name], nil
}

type omFrontendClient struct {
	cacher config.Cacher
}

func newOmFrontendClient(cfg config.View) *omFrontendClient {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromConfig(cfg, "openmatch.frontend")
		if err != nil {
			return nil, nil, err
		}

		close := func() {
			// TODO: handle close error
			_ = conn.Close()

		}

		return ompb.NewFrontendServiceClient(conn), close, nil
	}

	return &omFrontendClient{
		cacher: config.NewViewCacher(cfg, newInstance),
	}
}

// CreateTicket sends a CreateTicketRequest to Open Match and returns the updated ticket.
func (fc *omFrontendClient) CreateTicket(ctx context.Context, req *ipb.TicketInternal) (*ompb.Ticket, error) {
	client, err := fc.cacher.Get()
	if err != nil {
		return nil, err
	}

	detailsAny, err := anypb.New(req)
	if err != nil {
		return nil, err
	}

	ticket := &ompb.Ticket{
		SearchFields: &ompb.SearchFields{
			Tags: []string{fmt.Sprintf("mode.%s", req.Gamemode)},
		},
		Extensions: map[string]*anypb.Any{
			"details": detailsAny,
		},
	}

	ticket, err = client.(ompb.FrontendServiceClient).CreateTicket(
		ctx,
		&ompb.CreateTicketRequest{
			Ticket: ticket,
		},
	)

	return ticket, err
}

// GetTicket fetches the ticket from Open Match.
func (fc *omFrontendClient) GetTicket(ctx context.Context, id string) (*ompb.Ticket, error) {
	client, err := fc.cacher.Get()
	if err != nil {
		return nil, err
	}

	ticket, err := client.(ompb.FrontendServiceClient).GetTicket(
		ctx,
		&ompb.GetTicketRequest{
			TicketId: id,
		},
	)

	return ticket, err
}

// DeleteTicket removes the ticket from Open Match.
func (fc *omFrontendClient) DeleteTicket(ctx context.Context, id string) error {
	client, err := fc.cacher.Get()
	if err != nil {
		return err
	}

	_, err = client.(ompb.FrontendServiceClient).DeleteTicket(
		ctx,
		&ompb.DeleteTicketRequest{
			TicketId: id,
		},
	)

	return err
}
