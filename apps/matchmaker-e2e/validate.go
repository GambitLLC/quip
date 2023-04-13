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
var expectedKeys = map[string]string{
	"auth.issuer":   "http://localhost",
	"auth.jwks_uri": "",

	"matchmaker.frontend.hostname":      "localhost",
	"matchmaker.frontend.port":          "",
	"matchmaker.matchfunction.hostname": "localhost",
	"matchmaker.matchfunction.port":     "",
	"matchmaker.redis.hostname":         "localhost",
	"matchmaker.redis.port":             "",

	"sockets.server.hostname": "localhost",
	"sockets.server.port":     "3001",
	"sockets.redis.hostname":  "localhost",
	"sockets.redis.port":      "",

	"broker.hostname": "localhost",
	"broker.port":     "",

	// should be connected to minimatch
	"openmatch.backend.hostname":  "localhost",
	"openmatch.backend.port":      "50499",
	"openmatch.frontend.hostname": "localhost",
	"openmatch.frontend.port":     "50499",
	"openmatch.query.hostname":    "localhost",
	"openmatch.query.port":        "50499",

	"agones.hostname": "localhost",
	"agones.port":     "",
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
		for key, expected := range expectedKeys {
			if expected == "" {
				if !cfg.IsSet(key) {
					log.Printf("key '%s' is not set, waiting for change", key)
					return
				}
			} else {
				if cfg.GetString(key) != expected {
					log.Printf("key '%s' is not '%s', waiting for change", key, expected)
					return
				}
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
