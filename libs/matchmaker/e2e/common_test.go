package e2e_test

import (
	"context"
	"os"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/inmemory"
)

// inmemory package expects working directory to be at root of project ('/quip')
func init() {
	_, filename, _, _ := runtime.Caller(0)
	idx := strings.LastIndex(filename, "quip")
	if idx == -1 {
		panic("expected to be in folder named 'quip'")
	}

	dir := filename[:idx+4]
	err := os.Chdir(dir)
	if err != nil {
		panic(err)
	}
}

var cfg config.View

func TestMain(m *testing.M) {
	var err error
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err = inmemory.Run(ctx)
	if err != nil {
		cancel()
		panic(err)
	}

	code := m.Run()
	cancel()

	// wait for minimatch process to actually be killed
	// TODO: make inmemory package better
	<-time.After(1 * time.Second)

	os.Exit(code)
}

func newContext(t *testing.T) context.Context {
	return context.Background()
}
