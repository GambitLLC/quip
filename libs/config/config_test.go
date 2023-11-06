package config_test

import (
	"os"
	"testing"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/require"
)

func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "config")
	if err != nil {
		panic(errors.WithMessage(err, "failed to create temporary directory"))
	}
	defer func() {
		err := os.RemoveAll(dir)
		if err != nil {
			panic(err)
		}
	}()

	// Create config symlink to temporary folder
	// This is because config.Read attempts to read from config/ folder
	// Create temporary symlink named configtmp first and then rename
	// to prevent potential issues
	if err := os.Remove("config.tmp"); err != nil && !errors.Is(err, os.ErrNotExist) {
		panic(errors.WithMessage(err, "failed to delete temporary file 'config.tmp'"))
	}

	if err := os.Symlink(dir, "config.tmp"); err != nil {
		panic(errors.WithMessage(err, "failed to symlink to temporary directory"))
	}

	if err := os.Rename("config.tmp", "config"); err != nil {
		panic(errors.WithMessage(err, "failed to rename symlink to 'config'"))
	}

	m.Run()

	if _, err := os.Lstat("config"); err == nil {
		err := os.Remove("config")
		if err != nil {
			panic(errors.WithMessage(err, "failed to delete 'config' symlink"))
		}
	} else {
		panic(errors.WithMessage(err, "os.Lstat failed"))
	}
}

func TestRead(t *testing.T) {
	defaultFile, err := os.Create("config/default.yml")
	require.NoError(t, err, "create default config failed")
	_ = defaultFile

	prodFile, err := os.Create("config/production.yml")
	require.NoError(t, err, "create production config failed")
	_ = prodFile

	cfg, err := config.Read()
	require.NoError(t, err, "config.Read failed")
	require.NotNil(t, cfg, "cfg is nil")
}

// TODO: test view_cacher
