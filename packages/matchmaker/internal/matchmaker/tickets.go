package matchmaker

import (
	"context"

	"github.com/rs/xid"
)

type ticketRequest struct {
	PlayerId string
	Gamemode string
}

func createTicket(ctx context.Context, req *ticketRequest) (id string, err error) {
	// TODO: implement
	return xid.New().String(), nil
}

func deleteTicket(ctx context.Context, id string) error {
	// TODO: implement
	return nil
}
