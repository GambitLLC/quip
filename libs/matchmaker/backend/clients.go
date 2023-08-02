package backend

import (
	"context"
	"fmt"

	agones "agones.dev/agones/pkg/allocation/go"
	"github.com/pkg/errors"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/rpc"
)

type agonesAllocationClient struct {
	cacher config.Cacher
}

func newAgonesAllocationClient(cfg config.View) *agonesAllocationClient {
	var newInstance config.NewInstanceFunc = func(cfg config.View) (interface{}, func(), error) {
		conn, err := rpc.GRPCClientFromConfig(cfg, "agones")
		if err != nil {
			return nil, nil, err
		}

		close := func() {
			// TODO: handle error
			_ = conn.Close()
		}

		return agones.NewAllocationServiceClient(conn), close, nil
	}

	return &agonesAllocationClient{
		cacher: config.NewViewCacher(cfg, newInstance),
	}
}

func (ac *agonesAllocationClient) Allocate(ctx context.Context, req *ipb.MatchDetails) (string, error) {
	client, err := ac.cacher.Get()
	if err != nil {
		return "", err
	}

	bs, err := protojson.Marshal(req)
	if err != nil {
		return "", errors.Wrap(err, "failed to marshal req")
	}

	resp, err := client.(agones.AllocationServiceClient).Allocate(
		ctx,
		&agones.AllocationRequest{
			Metadata: &agones.MetaPatch{
				Annotations: map[string]string{
					"details": string(bs),
				},
			},
			GameServerSelectors: []*agones.GameServerSelector{},
		},
	)
	if err != nil {
		return "", err
	}

	ports := resp.GetPorts()
	if len(ports) < 1 {
		return "", errors.New("allocation response returned 0 ports")
	}

	ip := fmt.Sprintf("%s:%d", resp.GetAddress(), ports[0].Port)
	return ip, nil
}
