package rpc

import (
	"fmt"
	"net"
	"os"

	"github.com/pkg/errors"
	"github.com/rs/zerolog"
	"google.golang.org/grpc"

	"github.com/GambitLLC/quip/libs/config"
)

type GRPCHandler func(*grpc.Server)

type ServerParams struct {
	logger   zerolog.Logger
	ln       net.Listener
	handlers []GRPCHandler
}

func NewServerParams(cfg config.View, serviceName string) (*ServerParams, error) {
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.GetInt(serviceName+".port")))
	if err != nil {
		return nil, errors.Errorf("listen failed: %s", err.Error())
	}

	// TODO: read cert files

	return &ServerParams{
		ln: ln,
		logger: zerolog.New(os.Stderr).With().
			Str("component", serviceName).
			Logger(),
	}, nil
}

func (p *ServerParams) AddHandler(h GRPCHandler) {
	p.handlers = append(p.handlers, h)
}

type Server struct {
	srv *grpc.Server
}

func (s *Server) Start(p *ServerParams) error {
	s.srv = grpc.NewServer() // TODO: server options

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
