package test

import (
	"os"
	"testing"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/stretchr/testify/require"
)

func NewGamesFile(t *testing.T, cfg config.Mutable) {
	f, err := os.CreateTemp("", "games")
	require.NoError(t, err, "os.CreateTemp failed")
	t.Cleanup(func() {
		os.Remove(f.Name())
	})

	cfg.Set("matchmaker.gamesFile", f.Name())
	_, err = f.WriteString(gamesFile)
	require.NoError(t, err, "f.Write failed")
}

const gamesFile = `{
	"test": {
		"teamCount": 2,
		"teamSize": 1
	}
}`
