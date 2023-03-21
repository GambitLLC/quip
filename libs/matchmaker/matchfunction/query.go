package matchfunction

import (
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
)

type omQueryClient struct {
	cacher *config.Cacher
}

func newOmQueryClient(cfg config.View) *omQueryClient {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		conn, err := grpc.Dial(
			fmt.Sprintf("%s:%d", cfg.GetString("openmatch.query.hostname"), cfg.GetInt("openmatch.query.port")),
			grpc.WithTransportCredentials(insecure.NewCredentials()),
		)
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
		cacher: config.NewCacher(cfg, newInstance),
	}
}

func (qc *omQueryClient) GetClient() (ompb.QueryServiceClient, error) {
	client, err := qc.cacher.Get()
	if err != nil {
		return nil, err
	}

	return client.(ompb.QueryServiceClient), nil
}
