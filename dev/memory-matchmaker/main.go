package main

import (
	"fmt"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"

	"github.com/alicebob/miniredis/v2"
	"github.com/spf13/viper"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/backend"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
)

const (
	serviceName = "memory-matchmaker"
	configName = "inmemory"
)

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGTERM, syscall.SIGINT)

	// create redis server in memory
	mredis := miniredis.NewMiniRedis()
	if err := mredis.StartAddr(":0"); err != nil {
		panic(err)
	}
	defer mredis.Close()

	if err := createMinimatchConfig(mredis.Port()); err != nil {
		panic(err)
	}	

	// find an open port for server to use
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		panic(err)
	}
	_, freePort, err := net.SplitHostPort(ln.Addr().String())
	if err != nil {
		panic(err)
	}
	if err := ln.Close(); err != nil {
		panic(err)
	}

	// create config file for processes to run and use
	if err := createMemoryConfig(freePort, mredis.Port()); err != nil {
		panic(err)
	}

	if err := os.Setenv("NODE_CONFIG_ENV", serviceName); err != nil {
		panic(err)
	}

	// run all matchmaker services
	go appmain.RunDaemon(serviceName, func(cfg config.View) appmain.Daemon {
		return director.New(cfg)
	})
	go appmain.RunGRPCService(serviceName, func(cfg config.View, b *appmain.GRPCBindings) error {
		if err := frontend.BindService(cfg, b); err != nil {
			return err
		}

		if err := backend.BindService(cfg, b); err != nil {
			return err
		}

		if err := matchfunction.BindService(cfg, b); err != nil {
			return err
		}

		// TODO: also run agones service with mock games

		return nil
	})

	// spawn processes for minimatch, default-evaluator, synchronizer
	minimatch := exec.Command("./minimatch")
	minimatch.Dir = "./build/e2e/bin"
	minimatch.Stdout = os.Stdout
	minimatch.Stderr = os.Stderr
	if err := minimatch.Start(); err != nil {
		panic(err)
	}

	synchronizer := exec.Command("./synchronizer")
	synchronizer.Dir = "./build/e2e/bin"
	synchronizer.Stdout = os.Stdout
	synchronizer.Stderr = os.Stderr
	if err := synchronizer.Start(); err != nil {
		panic(err)
	}

	evaluator := exec.Command("./default-evaluator")
	evaluator.Dir = "./build/e2e/bin"
	evaluator.Stdout = os.Stdout
	evaluator.Stderr = os.Stderr
	if err := evaluator.Start(); err != nil {
		panic(err)
	}

	<-c

	minimatch.Process.Kill()
	synchronizer.Process.Kill()
	evaluator.Process.Kill()
	minimatch.Wait()
	synchronizer.Wait()
	evaluator.Wait()
}

func createMemoryConfig(serverPort, mredisPort string) ( error) {
	dcfg, err := config.ReadFile("default")
	if err != nil {
		return err
	}

	cfg := viper.New()
	for _, key := range dcfg.AllKeys() {
		// Configure all hosts to be localhost
		if strings.HasSuffix(key, "hostname") {
			cfg.Set(key, "localhost")
			continue
		}

		// all matchmaker services should be on the provided server port
		if strings.HasPrefix(key, "matchmaker") && strings.HasSuffix(key, "port") {
			cfg.Set(key, serverPort)
			continue
		}

		// all openmatch services should be on minimatch port
		if strings.HasPrefix(key, "openmatch") && strings.HasSuffix(key, "port") {
			cfg.Set(key, 50499)
			continue
		}
	}

	cfg.Set(fmt.Sprintf("%s.hostname", serviceName), "")
	cfg.Set(fmt.Sprintf("%s.port", serviceName), serverPort)

	cfg.Set("matchmaker.redis.port", mredisPort)
	cfg.Set("broker.hostname", "localhost")
	cfg.Set("broker.port", mredisPort)

	cfg.SetConfigType("yaml")
	return cfg.WriteConfigAs("config/"+serviceName)
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
