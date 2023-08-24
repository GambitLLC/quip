package test

import (
	"crypto/x509"
	"os"

	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/GambitLLC/quip/libs/config"
)

func NewGRPCClient(cfg config.View, addr string, opts ...grpc.DialOption) (*grpc.ClientConn, error) {
	trustedCertFile := cfg.GetString("api.tls.rootCertificateFile")
	if len(trustedCertFile) > 0 {
		trustedCertData, err := os.ReadFile(trustedCertFile)
		if err != nil {
			return nil, errors.WithMessagef(err, "failed to read client trusted certificate file")
		}

		pool := x509.NewCertPool()
		if !pool.AppendCertsFromPEM(trustedCertData) {
			return nil, errors.New("failed to append client trusted certificate data to pool")
		}

		opts = append(opts, grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(pool, "")))
	} else {
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	return grpc.Dial(addr, opts...)
}
