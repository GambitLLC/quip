package config

import (
	"fmt"
	"log"
	"os"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func Read() (*viper.Viper, error) {
	var err error
	// read in default config values
	dcfg := viper.New()
	dcfg.SetConfigType("yaml")
	dcfg.AddConfigPath("./config")
	dcfg.AddConfigPath("/app/config") // config path should math volume mount path in k8s
	dcfg.SetConfigName("default")
	err = dcfg.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("fatal error reading default config file: %s", err.Error())
	}

	// read any overridden
	cfg := viper.New()

	// set defaults for cfg
	for k, v := range dcfg.AllSettings() {
		cfg.SetDefault(k, v)
	}

	cfg.SetConfigType("yaml")
	cfg.AddConfigPath("./config")
	// Config path should be set via volume mount path in k8s
	cfg.AddConfigPath("/app/config")
	if name := os.Getenv("NODE_CONFIG_ENV"); name != "" {
		cfg.SetConfigName(name)
	} else {
		cfg.SetConfigName("production")
	}

	err = cfg.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("fatal error reading config file: %s", err.Error())
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

// View is a read-only view of Viper configs.
// New accessors from Viper should be added here.
type View interface {
	IsSet(string) bool
	Get(string) interface{}
	GetString(string) string
	GetInt(string) int
	GetInt32(string) int32
	GetInt64(string) int64
}

type Mutable interface {
	View
	Set(string, any)
}
