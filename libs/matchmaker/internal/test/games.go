package test

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/stretchr/testify/require"
)

var gameListing = games.GameListing{
	"test_1x1": {
		TeamCount: 1,
		TeamSize:  1,
	},
	"test_2x1": {
		TeamCount: 2,
		TeamSize:  1,
	},
}

func NewGamesFile(t *testing.T, cfg config.Mutable) {
	bs, err := json.Marshal(gameListing)
	require.NoError(t, err, "json.Marshal gameListing failed")

	f, err := os.CreateTemp("", "games")
	require.NoError(t, err, "os.CreateTemp failed")
	t.Cleanup(func() {
		os.Remove(f.Name())
	})

	_, err = f.Write(bs)
	require.NoError(t, err, "f.Write failed")

	cfg.Set("matchmaker.gamesFile", f.Name())
}
