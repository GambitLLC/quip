package apptest

import (
	"context"
	"testing"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
)

func TestDaemon(t *testing.T, cfg config.View, daemon func(config.View) appmain.Daemon) {
	d := daemon(cfg)

	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	go func() {
		err := d.Start(ctx)
		if err != nil {
			t.Error(err)
		}
	}()
}
