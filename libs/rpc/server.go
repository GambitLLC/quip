package rpc

import (
	"fmt"
	"log"
	"net"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
)

type GRPCHandler func(*grpc.Server)

type ServerParams struct {
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
		log.Printf("Serving gRPC: %s", p.ln.Addr().String())
		err := s.srv.Serve(p.ln)
		if err != nil {
			log.Printf("serve gRPC failed: %s", err.Error())
		}
	}()
	return nil
}

func (s *Server) Stop() error {
	s.srv.Stop()
	return nil
}
