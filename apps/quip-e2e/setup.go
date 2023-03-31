//go:build setup

package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"strings"
	"syscall"

	agones "agones.dev/agones/pkg/allocation/go"
	"github.com/alicebob/miniredis/v2"
	"github.com/spf13/viper"
	"google.golang.org/grpc"

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
		"test_100x1": {
			"teams":   100,
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

	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		panic(err)
	}

	_, port, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		panic(err)
	}

	s := grpc.NewServer()
	agones.RegisterAllocationServiceServer(s, &stubAgonesService{})

	go func() {
		err := s.Serve(ln)
		if err != nil {
			panic(err)
		}
	}()
	defer s.Stop()

	copy.Set("agones.hostname", "localhost")
	copy.Set("agones.port", port)

	updateKey(cfg, copy, "", "redis.hostname", "localhost")
	updateKey(cfg, copy, "", "redis.port", mredis.Port())

	copy.Set("broker.hostname", "localhost")
	copy.Set("broker.port", mredis.Port())

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

type stubAgonesService struct {
	agones.UnimplementedAllocationServiceServer
}

func (s *stubAgonesService) Allocate(context.Context, *agones.AllocationRequest) (*agones.AllocationResponse, error) {
	return &agones.AllocationResponse{Address: "127.0.0.1", Ports: []*agones.AllocationResponse_GameServerStatusPort{{Port: 51383}}}, nil
}
