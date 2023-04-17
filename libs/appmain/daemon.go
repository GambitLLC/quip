package appmain

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/rs/zerolog/log"
)

type Daemon interface {
	Start(context.Context) error
}

// RunDaemon runs the given service forever. For use in main functions.
func RunDaemon(daemon func(config.View) Daemon) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read()
	if err != nil {
		panic(err)
	}

	d := daemon(cfg)

	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		log.Print("Running service")
		err := d.Start(ctx)
		if err != nil {
			panic(err)
		}
	}()

	<-c
	cancel()

	log.Print("Daemon stopped successfully")
}
