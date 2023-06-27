package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/libs/matchmaker/inmemory"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	ctx, cancel := context.WithCancel(context.Background())
	cfg, err := inmemory.Run(ctx)
	if err != nil {
		cancel()
		panic(err)
	}

	log.Print(cfg.AllSettings())

	<-c
	cancel()
}
