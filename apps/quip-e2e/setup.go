package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/alicebob/miniredis/v2"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":6379"); err != nil {
		panic(err)
	}

	<-c
	mredis.Close()
}
