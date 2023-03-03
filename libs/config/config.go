package config

import (
	"fmt"
	"log"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func Config(name string) string {
	result := "Config " + name
	return result
}

func Read(name string) (*viper.Viper, error) {
	cfg := viper.New()

	cfg.SetConfigType("yaml")
	cfg.AddConfigPath(".")
	// Config path should be set via volume mount path in k8s
	cfg.AddConfigPath("/app/config")
	cfg.SetConfigName(name)

	err := cfg.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("fatal error reading config file, desc: %s", err.Error())
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
	GetString(string) string
	GetInt(string) int
	GetInt32(string) int32
	GetInt64(string) int64
}

type Mutable interface {
	View
	Set(string, any)
}
