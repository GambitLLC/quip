package games

import (
	"fmt"

	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
)

type MatchProfileCache struct {
	config.Cacher
}

func NewMatchProfileCache() *MatchProfileCache {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		details, err := parseGameDetails(cfg)
		if err != nil {
			return nil, nil, err
		}

		profiles := make([]*ompb.MatchProfile, 0, len(details))
		for name, details := range details {
			profile := &ompb.MatchProfile{
				Name: fmt.Sprintf("profile-%s", name),
				Pools: []*ompb.Pool{
					{
						Name: "all",
						TagPresentFilters: []*ompb.TagPresentFilter{
							{Tag: fmt.Sprintf("mode.%s", name)},
						},
					},
				},
				Extensions: make(map[string]*anypb.Any),
			}
			if err := protoext.SetExtensionDetails(profile, details); err != nil {
				return nil, nil, err
			}

			profiles = append(profiles, profile)
		}

		return profiles, nil, nil
	}

	return &MatchProfileCache{
		Cacher: config.NewFileCacher("games", newInstance),
	}
}

func (c *MatchProfileCache) Profiles() ([]*ompb.MatchProfile, error) {
	profiles, err := c.Cacher.Get()
	if err != nil {
		return nil, err
	}

	return profiles.([]*ompb.MatchProfile), nil
}

type GameDetailCache struct {
	config.Cacher
}

func NewGameDetailCache() *GameDetailCache {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		details, err := parseGameDetails(cfg)
		return details, nil, err
	}

	return &GameDetailCache{
		Cacher: config.NewFileCacher("games", newInstance),
	}
}

func (c *GameDetailCache) GameDetails(name string) (*ipb.ProfileDetails, error) {
	games, err := c.Cacher.Get()
	if err != nil {
		return nil, err
	}

	return games.(map[string]*ipb.ProfileDetails)[name], nil
}

func parseGameDetails(cfg config.View) (map[string]*ipb.ProfileDetails, error) {
	games, ok := cfg.Get("games").(map[string]interface{})
	if !ok {
		return nil, errors.New("failed to read 'games' from config")
	}

	gameDetails := make(map[string]*ipb.ProfileDetails, len(games))

	for name, details := range games {
		detailMap, ok := details.(map[string]interface{})
		if !ok {
			return nil, errors.Errorf("'games.%s' is malformed: should be map", name)
		}

		teams, ok := detailMap["teams"].(int)
		if !ok || teams <= 0 {
			return nil, errors.Errorf("'games.%s' is missing valid teams value: should be int >= 0", name)
		}

		players, ok := detailMap["players"].(int)
		if !ok || players <= 0 {
			return nil, errors.Errorf("'games.%s' is missing valid players value: should be int >= 0", name)
		}

		gameDetails[name] = &ipb.ProfileDetails{
			Gamemode: name,
			Teams:    uint32(teams),
			Players:  uint32(players),
		}
	}

	return gameDetails, nil
}
