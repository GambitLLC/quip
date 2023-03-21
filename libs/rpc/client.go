package rpc

import (
	"fmt"

	"github.com/GambitLLC/quip/libs/config"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func GRPCClientFromConfig(cfg config.View, prefix string) (*grpc.ClientConn, error) {
	addr := fmt.Sprintf(
		"%s:%d",
		cfg.GetString(prefix+".hostname"),
		cfg.GetInt(prefix+".port"),
	)

	// TODO: configure other options
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}

	// TODO: tls transport credentials

	return grpc.Dial(addr, opts...)
}
