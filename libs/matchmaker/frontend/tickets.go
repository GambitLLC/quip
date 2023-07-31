package frontend

import (
	"context"
	"fmt"

	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/libs/rpc"
)

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
func (fc *omFrontendClient) CreateTicket(ctx context.Context, req *ipb.TicketDetails) (*ompb.Ticket, error) {
	client, err := fc.cacher.Get()
	if err != nil {
		return nil, err
	}

	ticket := &ompb.Ticket{
		SearchFields: &ompb.SearchFields{
			Tags: []string{fmt.Sprintf("mode.%s", req.Gamemode)},
		},
	}

	if err := protoext.SetOpenMatchTicketDetails(ticket, req); err != nil {
		return nil, err
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
