package main

import (
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
			"players": 2,
		},
	})
	if err := gameCfg.WriteConfigAs("config/games.yaml"); err != nil {
		panic(err)
	}

	// create config/e2e.yaml if it doesn't exist
	f, err := os.OpenFile("config/e2e.yaml", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	_ = f.Close()

	cfg, err := config.Read()
	if err != nil {
		panic(err)
	}

	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		panic(err)
	}

	updateKey(cfg, "", "redis.hostname", "localhost")
	updateKey(cfg, "", "redis.port", mredis.Port())
	updateKey(cfg, "", "broker.hostname", "localhost")
	updateKey(cfg, "", "broker.port", mredis.Port())

	// openmatch should be running on minimatch -- everything on port 50499
	updateKey(cfg, "openmatch", "port", 50499)

	if err := cfg.WriteConfigAs("config/e2e.yaml"); err != nil {
		panic(err)
	}

	<-c
	mredis.Close()
}

func updateKey(cfg *viper.Viper, prefix, suffix string, val interface{}) {
	for _, key := range cfg.AllKeys() {
		if strings.HasPrefix(key, prefix) && strings.HasSuffix(key, suffix) {
			cfg.Set(key, val)
		}
	}
}
