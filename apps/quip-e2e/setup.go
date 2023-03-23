package main

import (
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

	cfg, err := config.Read()
	if err != nil {
		panic(err)
	}

	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		panic(err)
	}
	defer mredis.Close()

	updateKey(cfg, "", "redis.hostname", "localhost")
	updateKey(cfg, "", "redis.port", mredis.Port())
	updateKey(cfg, "", "broker.hostname", "localhost")
	updateKey(cfg, "", "broker.port", mredis.Port())

	// openmatch should be running on minimatch -- everything on port 50499
	updateKey(cfg, "openmatch", "port", 50499)

	if err := cfg.WriteConfig(); err != nil {
		panic(err)
	}

	<-c
	log.Print("e2e setup ended successfully")
}

func updateKey(cfg *viper.Viper, prefix, suffix string, val interface{}) {
	for _, key := range cfg.AllKeys() {
		if strings.HasPrefix(key, prefix) && strings.HasSuffix(key, suffix) {
			cfg.Set(key, val)
		}
	}
}
