package rpc

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"os"
	"time"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/keepalive"

	"github.com/GambitLLC/quip/libs/config"
)

const (
	serverPublicCertificateFileConfigKey = "api.tls.certificateFile"
	serverPrivateKeyFileConfigKey        = "api.tls.privateKeyFile"
	serverRootCertificatePathConfigKey   = "api.tls.rootCertificateFile"
)

type GRPCHandler func(*grpc.Server)

// type AuthFunction func(context.Context) (context.Context, error)

type ServerParams struct {
	logger   zerolog.Logger
	ln       net.Listener
	handlers []GRPCHandler
	ui       []grpc.UnaryServerInterceptor
	si       []grpc.StreamServerInterceptor

	// Public certificate in PEM format.
	// If this field is the same as rootCaPublicCertificateFileData then the certificate is not backed by a CA.
	publicCertData []byte
	// Private key in PEM format.
	privateKeyData []byte
}

func NewServerParams(cfg config.View, serviceName string, listen func(string, string) (net.Listener, error)) (*ServerParams, error) {
	logger := zerolog.New(os.Stderr).With().
		Str("component", serviceName).
		Logger()

	ln, err := listen("tcp", fmt.Sprintf(":%d", cfg.GetInt(serviceName+".port")))
	if err != nil {
		return nil, errors.Errorf("listen failed: %s", err.Error())
	}

	params := &ServerParams{
		ln:     ln,
		logger: logger,
	}

	// Read TLS certificate data if provided
	certFile := cfg.GetString(serverPublicCertificateFileConfigKey)
	privateKeyFile := cfg.GetString(serverPrivateKeyFileConfigKey)
	if len(certFile) > 0 && len(privateKeyFile) > 0 {
		logger.Debug().
			Str("cert_file", certFile).Str("priv_key", privateKeyFile).
			Msg("Loading TLS certificate and private key")

		params.publicCertData, err = os.ReadFile(certFile)
		if err != nil {
			if err := ln.Close(); err != nil {
				logger.Error().Err(err).Msg("failed to close listener")
			}

			return nil, errors.WithMessagef(err, "failed to read server certificate file")
		}

		params.privateKeyData, err = os.ReadFile(privateKeyFile)
		if err != nil {
			if err := ln.Close(); err != nil {
				logger.Error().Err(err).Msg("failed to close listener")
			}

			return nil, errors.WithMessagef(err, "failed to read server private key file")
		}
	}

	return params, nil
}

func (p *ServerParams) AddHandler(h GRPCHandler) {
	p.handlers = append(p.handlers, h)
}

type WrappedStream struct {
	grpc.ServerStream
	Ctx context.Context
}

func (s *WrappedStream) Context() context.Context {
	return s.Ctx
}

func (p *ServerParams) AddUnaryInterceptor(ui grpc.UnaryServerInterceptor) {
	p.ui = append(p.ui, ui)
}

func (p *ServerParams) AddStreamInterceptor(si grpc.StreamServerInterceptor) {
	p.si = append(p.si, si)
}

type Server struct {
	srv *grpc.Server
}

func (s *Server) Start(p *ServerParams) error {
	opts := []grpc.ServerOption{
		grpc.KeepaliveEnforcementPolicy(
			keepalive.EnforcementPolicy{
				MinTime:             10 * time.Second,
				PermitWithoutStream: true,
			},
		),
	}
	if len(p.publicCertData) > 0 {
		cert, err := tls.X509KeyPair(p.publicCertData, p.privateKeyData)
		if err != nil {
			return err
		}

		opts = append(opts, grpc.Creds(credentials.NewServerTLSFromCert(&cert)))
	}

	// TODO: add unary interceptors too
	if p.ui != nil {
		opts = append(opts, grpc.ChainUnaryInterceptor(p.ui...))
	}

	if p.si != nil {
		opts = append(opts, grpc.ChainStreamInterceptor(p.si...))
	}

	s.srv = grpc.NewServer(opts...)

	for _, handler := range p.handlers {
		handler(s.srv)
	}

	go func() {
		p.logger.Info().Msgf("Serving gRPC: %s", p.ln.Addr().String())
		err := s.srv.Serve(p.ln)
		if err != nil {
			p.logger.Error().Err(err).Msg("Serve gRPC failed")
		}
	}()
	return nil
}

func (s *Server) Stop() error {
	s.srv.Stop()
	return nil
}
