package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/dev/memory-matchmaker/inmemory"
)

func main() {
	// inmemory.StartFull()
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	ctx, cancel := context.WithCancel(context.Background())

	if err := inmemory.Run(ctx); err != nil {
		cancel()
		panic(err)
	}

	<-c
	cancel()
}
