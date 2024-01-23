package apptest

import (
	"context"
	"testing"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/config"
)

func TestDaemon(t *testing.T, cfg config.View, daemon func(config.View) appmain.Daemon) {
	d := daemon(cfg)

	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	go func() {
		err := d.Run(ctx)
		if err != nil {
			t.Error(err)
		}
	}()
}
