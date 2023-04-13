//go:build setup

package main

import (
	"context"
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

	if err := createGamesConfig(); err != nil {
		panic(err)
	}

	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		panic(err)
	}
	defer mredis.Close()

	// spin up mock agones server
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		panic(err)
	}

	_, agonesPort, err := net.SplitHostPort(ln.Addr().String())
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

	// write all config values for testing
	if err := createE2EConfig(mredis.Port(), agonesPort); err != nil {
		panic(err)
	}

	if err := createMinimatchConfig(mredis.Port()); err != nil {
		panic(err)
	}

	<-c
	log.Print("e2e setup ended successfully")
}

func createGamesConfig() error {
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

	return gameCfg.WriteConfigAs("config/games.yaml")
}

func createE2EConfig(redisPort, agonesPort string) error {
	cfg, err := config.ReadFile("e2e")
	if err != nil {
		return err
	}

	// must get list of all keys from default config to override all matching keys
	dcfg, err := config.ReadFile("default")
	if err != nil {
		return err
	}

	cfg.Set("agones.hostname", "localhost")
	cfg.Set("agones.port", agonesPort)

	overrideKey(cfg, dcfg, "", "redis.hostname", "localhost")
	overrideKey(cfg, dcfg, "", "redis.port", redisPort)

	cfg.Set("broker.hostname", "localhost")
	cfg.Set("broker.port", redisPort)

	// openmatch should be running on minimatch -- everything on port 50499
	overrideKey(cfg, dcfg, "openmatch", "hostname", "localhost")
	overrideKey(cfg, dcfg, "openmatch", "port", 50499)

	cfg.Set("sockets.server.hostname", "localhost")
	cfg.Set("sockets.server.port", 3001)

	// spin up matchmaker services on another port as well
	cfg.Set("matchmaker.frontend.hostname", "localhost")
	cfg.Set("matchmaker.frontend.port", 50496)
	cfg.Set("matchmaker.backend.hostname", "localhost")
	cfg.Set("matchmaker.backend.port", 50495)
	cfg.Set("matchmaker.matchfunction.hostname", "localhost")
	cfg.Set("matchmaker.matchfunction.port", 50490)

	return cfg.WriteConfig()
}

func createMinimatchConfig(redisPort string) error {
	cfg := viper.New()
	cfg.SetConfigType("yaml")
	if err := cfg.ReadConfig(strings.NewReader(minimatchDefaultConfig)); err != nil {
		return err
	}

	cfg.Set("redis.port", redisPort)
	if err := cfg.WriteConfigAs("build/e2e/bin/matchmaker_config_default.yaml"); err != nil {
		return err
	}

	return os.WriteFile("build/e2e/bin/matchmaker_config_override.yaml", []byte(minimatchOverrideConfig), 0666)
}

func overrideKey(cfg, dcfg *viper.Viper, prefix, suffix string, val interface{}) {
	for _, key := range dcfg.AllKeys() {
		if strings.HasPrefix(key, prefix) && strings.HasSuffix(key, suffix) {
			cfg.Set(key, val)
		}
	}
}

type stubAgonesService struct {
	agones.UnimplementedAllocationServiceServer
}

func (s *stubAgonesService) Allocate(context.Context, *agones.AllocationRequest) (*agones.AllocationResponse, error) {
	return &agones.AllocationResponse{Address: "127.0.0.1", Ports: []*agones.AllocationResponse_GameServerStatusPort{{Port: 51383}}}, nil
}

const minimatchDefaultConfig string = `
logging:
  level: debug
  format: text
  rpc: false
# Open Match applies the exponential backoff strategy for its retryable gRPC calls.
# The settings below are the default backoff configuration used in Open Match.
# See https://github.com/cenkalti/backoff/blob/v3/exponential.go for detailed explanations
backoff:
  # The initial retry interval (in milliseconds)
  initialInterval: 100ms
  # maxInterval caps the maximum time elapsed for a retry interval
  maxInterval: 500ms
  # The next retry interval is multiplied by this multiplier
  multiplier: 1.5
  # Randomize the retry interval
  randFactor: 0.5
  # maxElapsedTime caps the retry time (in milliseconds)
  maxElapsedTime: 3000ms

api:
  synchronizer:
    hostname: "localhost"
    grpcport: "50498"
    httpport: "51498"
  minimatch:
    grpcport: "50499"
    httpport: "51499"

redis:
  hostname: localhost
  port: 6379

telemetry:
  reportingPeriod: "1m"
  traceSamplingFraction: "0.01"
  zpages:
    enable: "false"
  jaeger:
    enable: "false"
  prometheus:
    enable: "false"
  stackdriverMetrics:
    enable: "false"
`

const minimatchOverrideConfig string = `
# Length of time between first fetch matches call, and when no further fetch
# matches calls will join the current evaluation/synchronization cycle,
# instead waiting for the next cycle.
registrationInterval: 250ms
# Length of time after match function as started before it will be canceled,
# and evaluator call input is EOF.
proposalCollectionInterval: 20s
# Time after a ticket has been returned from fetch matches (marked as pending)
# before it automatically becomes active again and will be returned by query
# calls.
pendingReleaseTimeout: 1m
# Time after a ticket has been assigned before it is automatically delted.
assignedDeleteTimeout: 10m
# Maximum number of tickets to return on a single QueryTicketsResponse.
queryPageSize: 10000
backfillLockTimeout: 1m
api:
  evaluator:
    hostname: "localhost"
    grpcport: "50497"
    httpport: "51497"
`
