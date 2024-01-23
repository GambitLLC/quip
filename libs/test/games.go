package test

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/games"
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

func NewGamesFile(t *testing.T, cfg config.Mutable, listing games.GameListing) {
	if listing == nil {
		listing = gameListing
	}
	bs, err := json.Marshal(listing)
	require.NoError(t, err, "json.Marshal game listing failed")

	f, err := os.CreateTemp("", "games")
	require.NoError(t, err, "os.CreateTemp failed")
	t.Cleanup(func() {
		os.Remove(f.Name())
	})

	_, err = f.Write(bs)
	require.NoError(t, err, "f.Write failed")

	cfg.Set("matchmaker.gamesFile", f.Name())
}
