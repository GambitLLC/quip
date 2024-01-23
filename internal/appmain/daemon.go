package appmain

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/zerolog/log"

	"github.com/GambitLLC/quip/internal/config"
)

type Daemon interface {
	Run(context.Context) error
}

// RunDaemon runs the given service forever. For use in main functions.
func RunDaemon(daemonName string, daemon func(config.View) Daemon) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read()
	if err != nil {
		log.Panic().Str("component", daemonName).Err(err).Msg("Failed to read config")
	}

	d := daemon(cfg)

	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		log.Info().Str("component", daemonName).Msg("Running daemon")
		err := d.Run(ctx)
		if err != nil {
			log.Panic().Str("component", daemonName).Err(err).Msg("Failed to run daemon")
		}
	}()

	<-c
	cancel()

	log.Info().Str("component", daemonName).Msg("Daemon stopped")
}
