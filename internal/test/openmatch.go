package test

import (
	"bytes"
	"context"
	"fmt"
	"net"
	"os/exec"
	"syscall"
	"testing"
	"time"

	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/test/data"
)

func NewOpenMatch(t *testing.T, extCfg config.Mutable) {
	dir := t.TempDir()

	// create default cfg
	defaultCfg := viper.New()
	defaultCfg.SetConfigType("yaml")
	err := defaultCfg.ReadConfig(bytes.NewBufferString(defaultCfgString))
	require.NoError(t, err, "failed to read default config")

	// set tls (open match has different key names, cannot use test.SetTLS)
	defaultCfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	defaultCfg.Set("api.tls.privateKey", data.Path("x509/server_key.pem"))
	defaultCfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

	for _, svc := range []string{"minimatch", "synchronizer", "evaluator"} {
		grpcport := getFreePort(t)
		httpport := getFreePort(t)

		defaultCfg.Set("api."+svc+".hostname", "localhost")
		defaultCfg.Set("api."+svc+".grpcport", grpcport)
		defaultCfg.Set("api."+svc+".httpport", httpport)

	}

	minimatchPort := defaultCfg.Get("api.minimatch.grpcport")
	for _, svc := range []string{"openmatch.frontend", "openmatch.backend", "openmatch.query"} {
		extCfg.Set(svc+".hostname", "localhost")
		extCfg.Set(svc+".port", minimatchPort)
	}

	NewRedis(t, defaultCfg)
	defaultCfg.Set("redis.hostname", "localhost")
	defaultCfg.Set("redis.port", defaultCfg.Get("matchmaker.redis.port"))

	err = defaultCfg.WriteConfigAs(dir + "/matchmaker_config_default")
	require.NoError(t, err, "failed to write default config")

	// create override cfg
	overrideCfg := viper.New()
	overrideCfg.SetConfigType("yaml")
	err = overrideCfg.ReadConfig(bytes.NewBufferString(overrideCfgString))
	require.NoError(t, err, "failed to read override config")

	err = overrideCfg.WriteConfigAs(dir + "/matchmaker_config_override")
	require.NoError(t, err, "failed to write override config")

	ctx, cancel := context.WithCancel(NewContext(t))
	t.Cleanup(cancel)

	// minimatch := exec.Command("go", "run", "open-match.dev/open-match/cmd/minimatch@latest")
	minimatch := exec.CommandContext(ctx, "minimatch")
	minimatch.Dir = dir
	// minimatch.Stdout = os.Stdout
	// minimatch.Stderr = os.Stderr
	require.NoError(t, minimatch.Start(), "start minimatch failed: make sure to run 'go install open-match.dev/open-match/cmd/minimatch@latest'")
	t.Cleanup(func() {
		require.NoError(t, minimatch.Process.Signal(syscall.SIGINT), "failed to signal SIGINT to minimatch")
		_ = minimatch.Wait()
	})

	// synchronizer := exec.CommandContext(ctx, "go", "run", "open-match.dev/open-match/cmd/synchronizer@latest")
	synchronizer := exec.CommandContext(ctx, "synchronizer")
	synchronizer.Dir = dir
	// synchronizer.Stdout = os.Stdout
	// synchronizer.Stderr = os.Stderr
	require.NoError(t, synchronizer.Start(), "start synchronizer failed: make sure to run 'go install open-match.dev/open-match/cmd/synchronizer@latest'")
	t.Cleanup(func() {
		require.NoError(t, synchronizer.Process.Signal(syscall.SIGINT), "failed to signal SIGINT to synchronizer")
		_ = synchronizer.Wait()
	})

	// evaluator := exec.CommandContext(ctx, "go", "run", "open-match.dev/open-match/cmd/default-evaluator@latest")
	evaluator := exec.CommandContext(ctx, "default-evaluator")
	evaluator.Dir = dir
	// evaluator.Stdout = os.Stdout
	// evaluator.Stderr = os.Stderr
	require.NoError(t, evaluator.Start(), "start evaluator failed: make sure to run 'go install open-match.dev/open-match/cmd/default-evaluator@latest'")
	t.Cleanup(func() {
		require.NoError(t, evaluator.Process.Signal(syscall.SIGINT), "failed to signal SIGINT to evaluator")
		_ = evaluator.Wait()
	})

}

func getFreePort(t *testing.T) string {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "SplitHostPort failed")
	// t.Logf("listening on port: %s", port)

	ch := make(chan struct{}, 1)
	go func(ln net.Listener) {
		conn, err := ln.Accept()
		require.NoError(t, err, "Accept failed")
		_ = conn.Close()
		_ = ln.Close()

		ch <- struct{}{}
	}(ln)

	// must dial to keep port in TIME_WAIT
	_, err = net.Dial("tcp", fmt.Sprintf("localhost:%s", port))
	require.NoError(t, err)

	select {
	case <-ch:
	case <-time.After(1 * time.Second):
		require.FailNow(t, "listener didn't accept and close conn after 3 seconds")
	}

	return port
}

const defaultCfgString = `api:
  minimatch:
    grpcport:
    httpport:
  synchronizer:
    grpcport:
    hostname:
    httpport:
  tls:
    certificatefile:
    privatekey:
    rootcertificatefile:
backoff:
  initialinterval: 100ms
  maxelapsedtime: 3000ms
  maxinterval: 500ms
  multiplier: 1.5
  randfactor: 0.5
logging:
  format: text
  level: debug
  rpc: false
redis:
  hostname:
  port:
telemetry:
  jaeger:
    enable: "false"
  prometheus:
    enable: "false"
  reportingperiod: 1m
  stackdrivermetrics:
    enable: "false"
  tracesamplingfraction: "0.01"
  zpages:
    enable: "false"
`

const overrideCfgString = `# Length of time between first fetch matches call, and when no further fetch
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
`
