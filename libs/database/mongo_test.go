package database

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

var cfg = viper.New()

func TestMain(m *testing.M) {
	var err error
	cfg.SetConfigType("yaml")
	cfg.AddConfigPath("../../config")
	cfg.SetConfigName("test")
	err = cfg.ReadInConfig()
	if err != nil {
		panic(err)
	}

	code := m.Run()
	os.Exit(code)
}
func TestConnection(t *testing.T) {
	client, err := newClient(cfg)
	require.NoError(t, err)

	t.Cleanup(func() { client.Disconnect(context.Background()) })

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	require.NoError(t, err, "Ping failed -- is the correct URI set in config/test.yaml?")
}

func TestInvalidConnectionURI(t *testing.T) {
	_, err := newClient(viper.New())
	require.Error(t, err)
}

func TestInvalidConnection(t *testing.T) {
	cfg := viper.New()
	cfg.Set(MongoConnectionURIConfigKey, "mongodb://invaliduri")

	client, err := newClient(cfg)
	require.NoError(t, err)

	t.Cleanup(func() { client.Disconnect(context.Background()) })

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Ping(ctx, nil)
	require.Error(t, err)
}
