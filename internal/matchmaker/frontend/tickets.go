package frontend

import (
	"context"
	"fmt"

	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/internal/rpc"
	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

type omFrontendClient struct {
	cacher config.Cacher
}

func newOmFrontendClient(cfg config.View) *omFrontendClient {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromService(cfg, "openmatch.frontend")
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
func (fc *omFrontendClient) CreateTicket(ctx context.Context, req *pb.TicketDetails) (*ompb.Ticket, error) {
	client, err := fc.cacher.Get()
	if err != nil {
		return nil, err
	}

	// TODO: validate cfg
	ticket := &ompb.Ticket{
		SearchFields: &ompb.SearchFields{
			Tags: []string{fmt.Sprintf("mode.%s", req.GetConfig().GetGamemode())},
		},
		Extensions: make(map[string]*anypb.Any),
	}

	if err := protoext.SetExtensionDetails(ticket, req); err != nil {
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
