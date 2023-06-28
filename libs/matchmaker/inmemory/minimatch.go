package inmemory

import (
	"context"
	"os"
	"os/exec"
	"strings"

	"github.com/GambitLLC/quip/libs/test/data"
	"github.com/spf13/viper"
	"golang.org/x/sync/errgroup"
)

func runMinimatch(ctx context.Context, redisPort string) error {
	if err := createMinimatchConfig(redisPort); err != nil {
		return err
	}

	eg, ctx := errgroup.WithContext(ctx)
	eg.Go(func() error {
		return runBinProc(ctx, "./minimatch")
	})

	eg.Go(func() error {
		return runBinProc(ctx, "./synchronizer")
	})

	eg.Go(func() error {
		return runBinProc(ctx, "./default-evaluator")
	})

	return eg.Wait()
}

func runBinProc(ctx context.Context, name string) error {
	cmd := exec.CommandContext(ctx, name)
	cmd.Dir = "./build/e2e/bin"
	err := cmd.Run()

	switch err := err.(type) {
	case *exec.ExitError:
		// ignore err if process terminated due to ctx closing
		if err.ProcessState.ExitCode() == -1 && !err.ProcessState.Exited() && ctx.Err() != nil {
			return nil
		}
	default:
	}

	return err
}

func createMinimatchConfig(redisPort string) error {
	cfg := viper.New()
	cfg.SetConfigType("yaml")
	if err := cfg.ReadConfig(strings.NewReader(minimatchDefaultConfig)); err != nil {
		return err
	}

	cfg.Set("redis.port", redisPort)

	// tls
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKey", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

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
