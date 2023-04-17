package config

import (
	"fmt"
	"os"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

func Read() (*viper.Viper, error) {
	dcfg, err := ReadFile("default")
	if err != nil {
		return nil, fmt.Errorf("fatal error reading default config file: %s", err.Error())
	}

	// read any overridden values
	var cfg *viper.Viper
	if name := os.Getenv("NODE_CONFIG_ENV"); name != "" {
		cfg, err = ReadFile(name)
	} else {
		cfg, err = ReadFile("production")
	}
	if err != nil {
		return nil, fmt.Errorf("fatal error reading config file: %s", err.Error())
	}

	// set defaults for cfg
	for k, v := range dcfg.AllSettings() {
		cfg.SetDefault(k, v)
	}

	// Watch for updates to the config; in Kubernetes, this is implemented using
	// a ConfigMap that is written to the config file.
	cfg.WatchConfig()
	cfg.OnConfigChange(func(event fsnotify.Event) {
		// Log whenever configuration changes.
		log.Printf("Server configuration changed, operation: %v, filename: %s", event.Op, event.Name)
	})

	return cfg, nil
}

func ReadFile(name string) (*viper.Viper, error) {
	cfg := viper.New()
	cfg.SetConfigType("yaml")
	cfg.AddConfigPath("./config")
	cfg.AddConfigPath("/app/config") // config path should math volume mount path in k8s
	cfg.SetConfigName(name)

	if err := cfg.ReadInConfig(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// View is a read-only view of Viper configs.
// New accessors from Viper should be added here.
type View interface {
	IsSet(string) bool
	Get(string) interface{}
	GetString(string) string
	GetInt(string) int
	GetInt32(string) int32
	GetInt64(string) int64
	GetDuration(string) time.Duration
}

type Mutable interface {
	View
	Set(string, any)
}
