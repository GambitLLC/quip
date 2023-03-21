package director

import (
	"context"
	"io"

	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/rpc"
)

// omBackendClient caches an open match BackendServiceClient.
type omBackendClient struct {
	cacher *config.Cacher
}

func newOMBackendClient(cfg config.View) *omBackendClient {
	var newInstance config.NewInstanceFunc = func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromConfig(cfg, "openmatch.backend")
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
		cacher: config.NewCacher(cfg, newInstance),
	}
}

func (bc *omBackendClient) FetchMatches(ctx context.Context, in *ompb.FetchMatchesRequest) ([]*ompb.Match, error) {
	client, err := bc.cacher.Get()
	if err != nil {
		return nil, err
	}

	stream, err := client.(ompb.BackendServiceClient).FetchMatches(ctx, in)
	if err != nil {
		return nil, err
	}

	var result []*ompb.Match
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		result = append(result, resp.GetMatch())
	}

	return result, nil
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
