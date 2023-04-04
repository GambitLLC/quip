//go:build validate

package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/fsnotify/fsnotify"
)

// list of keys which setup must have updated
var expectedKeys = []string{
	"auth.issuer",
	"auth.jwks_uri",

	"matchmaker.redis.hostname",
	"matchmaker.redis.port",

	"sockets.redis.hostname",
	"sockets.redis.port",

	"broker.hostname",
	"broker.port",

	"openmatch.backend.hostname",
	"openmatch.backend.port",

	"openmatch.frontend.hostname",
	"openmatch.frontend.port",

	"openmatch.query.hostname",
	"openmatch.query.port",

	"agones.hostname",
	"agones.port",
}

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	cfg, err := config.Read()
	if err != nil {
		panic(err)
	}

	// make sure e2e config file is being read
	if !strings.HasSuffix(cfg.ConfigFileUsed(), "e2e.yaml") {
		panic(fmt.Sprintf("expected e2e.yaml file to be read, got '%s'", cfg.ConfigFileUsed()))
	}

	done := make(chan struct{})
	closeOnce := sync.Once{}

	checkConfig := func() {
		for _, key := range expectedKeys {
			if !cfg.IsSet(key) {
				log.Printf("key '%s' is not set, waiting for change", key)
				return
			}
		}

		closeOnce.Do(func() { close(done) })
	}

	cfg.WatchConfig()
	cfg.OnConfigChange(func(in fsnotify.Event) {
		checkConfig()
	})

	checkConfig()

	select {
	case <-done:
		log.Print("setup validated successfully")
	case <-c:
		log.Print("validation cancelled")
	case <-time.After(3 * time.Second):
		panic("validation timed out")
	}
}
