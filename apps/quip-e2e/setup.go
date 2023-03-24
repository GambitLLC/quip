//go:build setup

package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/alicebob/miniredis/v2"
	"github.com/spf13/viper"

	"github.com/GambitLLC/quip/libs/config"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	// override games config for e2e testing
	gameCfg := viper.New()
	gameCfg.Set("games", map[string]map[string]interface{}{
		"test": {
			"teams":   1,
			"players": 1,
		},
	})
	if err := gameCfg.WriteConfigAs("config/games.yaml"); err != nil {
		panic(err)
	}

	cfg, err := config.ReadFile("e2e")
	if err != nil {
		panic(err)
	}

	// create a copy so only select values are written and not all default values
	// this is because AllSettings() includes default settings
	copy := viper.New()
	for key, val := range cfg.AllSettings() {
		copy.Set(key, val)
	}

	cfg, err = config.Read()
	if err != nil {
		panic(err)
	}

	if !strings.HasSuffix(cfg.ConfigFileUsed(), "e2e.yaml") {
		panic(fmt.Sprintf("expected e2e.yaml file to be read, got '%s'", cfg.ConfigFileUsed()))
	}

	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		panic(err)
	}
	defer mredis.Close()

	updateKey(cfg, copy, "", "redis.hostname", "localhost")
	updateKey(cfg, copy, "", "redis.port", mredis.Port())
	updateKey(cfg, copy, "", "broker.hostname", "localhost")
	updateKey(cfg, copy, "", "broker.port", mredis.Port())

	// openmatch should be running on minimatch -- everything on port 50499
	updateKey(cfg, copy, "openmatch", "hostname", "localhost")
	updateKey(cfg, copy, "openmatch", "port", 50499)

	if err := copy.WriteConfigAs(cfg.ConfigFileUsed()); err != nil {
		panic(err)
	}

	<-c
	log.Print("e2e setup ended successfully")
}

func updateKey(cfg, copy *viper.Viper, prefix, suffix string, val interface{}) {
	for _, key := range cfg.AllKeys() {
		if strings.HasPrefix(key, prefix) && strings.HasSuffix(key, suffix) {
			copy.Set(key, val)
		}
	}
}
