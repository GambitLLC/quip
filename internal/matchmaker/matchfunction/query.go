package matchfunction

import (
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/rpc"
)

type omQueryClient struct {
	cacher config.Cacher
}

func newOmQueryClient(cfg config.View) *omQueryClient {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromService(cfg, "openmatch.query")
		if err != nil {
			return nil, nil, err
		}

		close := func() {
			// TODO: handle close error
			_ = conn.Close()

		}

		return ompb.NewQueryServiceClient(conn), close, nil
	}

	return &omQueryClient{
		cacher: config.NewViewCacher(cfg, newInstance),
	}
}

func (qc *omQueryClient) GetClient() (ompb.QueryServiceClient, error) {
	client, err := qc.cacher.Get()
	if err != nil {
		return nil, err
	}

	return client.(ompb.QueryServiceClient), nil
}
