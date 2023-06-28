package e2e_test

import (
	"context"
	"os"
	"runtime"
	"strings"
	"testing"

	"github.com/GambitLLC/quip/libs/matchmaker/inmemory"
	"github.com/spf13/viper"
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

var cfg *viper.Viper

func TestMain(m *testing.M) {
	cfg = viper.New()
	proc, err := inmemory.Start(cfg)
	if err != nil {
		panic(err)
	}

	code := m.Run()
	proc.Kill()
	if err := proc.Wait(); err != nil {
		panic(err)
	}

	os.Exit(code)
}

func newContext(t *testing.T) context.Context {
	return context.Background()
}
