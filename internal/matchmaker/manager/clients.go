package manager

import (
	"context"

	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/rpc"
)

// omBackendClient caches an open match BackendServiceClient.
type omBackendClient struct {
	cacher config.Cacher
}

func newOMBackendClient(cfg config.View) *omBackendClient {
	var newInstance config.NewInstanceFunc = func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromService(cfg, "openmatch.backend")
		if err != nil {
			return nil, nil, err
		}

		close := func() {
			// TODO: handle error
			_ = conn.Close()
		}

		return ompb.NewBackendServiceClient(conn), close, nil
	}

	return &omBackendClient{
		cacher: config.NewViewCacher(cfg, newInstance),
	}
}

func (bc *omBackendClient) AssignTickets(ctx context.Context, in *ompb.AssignTicketsRequest) (*ompb.AssignTicketsResponse, error) {
	client, err := bc.cacher.Get()
	if err != nil {
		return nil, err
	}

	return client.(ompb.BackendServiceClient).AssignTickets(ctx, in)
}

func (bc *omBackendClient) ReleaseTickets(ctx context.Context, in *ompb.ReleaseTicketsRequest) (*ompb.ReleaseTicketsResponse, error) {
	client, err := bc.cacher.Get()
	if err != nil {
		return nil, err
	}

	return client.(ompb.BackendServiceClient).ReleaseTickets(ctx, in)
}
