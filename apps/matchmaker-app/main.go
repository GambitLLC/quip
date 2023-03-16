package main

import (
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker"
	"github.com/GambitLLC/quip/libs/pb"
	"google.golang.org/grpc"
)

func main() {
	c := make(chan os.Signal, 1)
	// SIGTERM is signaled by k8s when it wants a pod to stop.
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read("production")
	if err != nil {
		panic(err)
	}

	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.GetInt("api.matchmaker.port")))
	if err != nil {
		panic(err)
	}

	s := grpc.NewServer()
	service := matchmaker.New(cfg)
	pb.RegisterMatchmakerServer(s, service)

	go func() {
		log.Printf("Serving on %s", ln.Addr().String())
		if err := s.Serve(ln); err != nil {
			panic(err)
		}
	}()

	<-c
	s.Stop()
	log.Print("Stopping server ...")
}
