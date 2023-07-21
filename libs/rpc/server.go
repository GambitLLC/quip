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

type AuthFunction func(context.Context) (context.Context, error)

type ServerParams struct {
	logger   zerolog.Logger
	ln       net.Listener
	handlers []GRPCHandler

	// Public certificate in PEM format.
	// If this field is the same as rootCaPublicCertificateFileData then the certificate is not backed by a CA.
	publicCertData []byte
	// Private key in PEM format.
	privateKeyData []byte

	authenticator AuthFunction
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

func (p *ServerParams) SetAuth(h AuthFunction) {
	p.authenticator = h
}

type Server struct {
	srv *grpc.Server
}

type wrappedStream struct {
	grpc.ServerStream
	ctx context.Context
}

func (s *wrappedStream) Context() context.Context {
	return s.ctx
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

	// TODO: chain with other unary interceptors
	if p.authenticator != nil {
		opts = append(opts,
			grpc.UnaryInterceptor(func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
				ctx, err = p.authenticator(ctx)
				if err != nil {
					return
				}

				return handler(ctx, req)
			}),
			grpc.StreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
				ctx, err := p.authenticator(ss.Context())
				if err != nil {
					return err
				}

				return handler(srv, &wrappedStream{
					ServerStream: ss,
					ctx:          ctx,
				})
			}),
		)
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
