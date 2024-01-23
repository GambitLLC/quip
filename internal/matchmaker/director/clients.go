package director

import (
	"context"
	"io"

	agonesPb "agones.dev/agones/pkg/allocation/go"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/rpc"
	"github.com/GambitLLC/quip/internal/sdk"
	"github.com/GambitLLC/quip/pkg/matchmaker/pb"
	"github.com/pkg/errors"
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

func (bc *omBackendClient) FetchMatches(ctx context.Context, in *ompb.FetchMatchesRequest) ([]*ompb.Match, error) {
	client, err := bc.cacher.Get()
	if err != nil {
		return nil, errors.WithMessage(err, "failed to get cached backend client")
	}

	stream, err := client.(ompb.BackendServiceClient).FetchMatches(ctx, in)
	if err != nil {
		return nil, errors.WithMessage(err, "failed to call FetchMatches")
	}

	var result []*ompb.Match
	for {
		resp, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, errors.WithMessage(err, "error occured during FetchMatches stream")
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

type agonesClient struct {
	cacher config.Cacher
}

func newAgonesClient(cfg config.View) *agonesClient {
	var newInstance config.NewInstanceFunc = func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromService(cfg, "agones")
		if err != nil {
			return nil, nil, err
		}

		close := func() {
			// TODO: handle error
			_ = conn.Close()
		}

		return agonesPb.NewAllocationServiceClient(conn), close, nil
	}

	return &agonesClient{
		cacher: config.NewViewCacher(cfg, newInstance),
	}
}

func (c *agonesClient) Allocate(ctx context.Context, details *pb.MatchDetails) (*agonesPb.AllocationResponse, error) {
	client, err := c.cacher.Get()
	if err != nil {
		return nil, err
	}

	md := &agonesPb.MetaPatch{
		Annotations: make(map[string]string),
	}
	if err := sdk.SetAnnotationDetails(md, details); err != nil {
		return nil, err
	}

	return client.(agonesPb.AllocationServiceClient).Allocate(
		ctx,
		&agonesPb.AllocationRequest{
			Metadata: md,
		},
	)
}
