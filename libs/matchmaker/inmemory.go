package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/libs/matchmaker/inmemory"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		if err := inmemory.Run(ctx); err != nil {
			panic(err)
		}
	}()

	<-c
	cancel()
}
