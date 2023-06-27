package rpc

import (
	"crypto/x509"
	"fmt"
	"os"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
)

const (
	clientTrustedCertificatePathConfigKey = serverRootCertificatePathConfigKey
)

var clientLogger = zerolog.New(os.Stderr).With().
	Str("component", "rpc.client").
	Logger()

func GRPCClientFromConfig(cfg config.View, prefix string, opts ...grpc.DialOption) (*grpc.ClientConn, error) {
	addr := fmt.Sprintf(
		"%s:%d",
		cfg.GetString(prefix+".hostname"),
		cfg.GetInt(prefix+".port"),
	)

	trustedCertFile := cfg.GetString(clientTrustedCertificatePathConfigKey)
	if len(trustedCertFile) > 0 {
		clientLogger.Debug().
			Str("trusted_cert_file", trustedCertFile).
			Msg("Loading TLS trusted certificate file")

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
