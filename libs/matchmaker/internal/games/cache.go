package games

import (
	"fmt"

	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
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
		// games, ok := cfg.Get("games").(map[string]interface{})
		// if !ok {
		// 	return nil, nil, errors.New("failed to read 'games' from config")
		// }

		profiles := make([]*ompb.MatchProfile, 0, len(details))
		for name, details := range details {
			detailsAny, err := anypb.New(details)
			if err != nil {
				return nil, nil, errors.WithMessagef(err, "failed to marshal game details for 'games.%s'", name)
			}

			profiles = append(profiles, &ompb.MatchProfile{
				Name: fmt.Sprintf("profile-%s", name),
				Pools: []*ompb.Pool{
					{
						Name: "all",
						TagPresentFilters: []*ompb.TagPresentFilter{
							{Tag: fmt.Sprintf("mode.%s", name)},
						},
					},
				},
				Extensions: map[string]*anypb.Any{
					"details": detailsAny,
				},
			})
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

func (c *GameDetailCache) GameDetails(name string) (*ipb.GameDetails, error) {
	games, err := c.Cacher.Get()
	if err != nil {
		return nil, err
	}

	return games.(map[string]*ipb.GameDetails)[name], nil
}

func parseGameDetails(cfg config.View) (map[string]*ipb.GameDetails, error) {
	games, ok := cfg.Get("games").(map[string]interface{})
	if !ok {
		return nil, errors.New("failed to read 'games' from config")
	}

	gameDetails := make(map[string]*ipb.GameDetails, len(games))

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

		gameDetails[name] = &ipb.GameDetails{
			Gamemode: name,
			Teams:    uint32(teams),
			Players:  uint32(players),
		}
	}

	return gameDetails, nil
}
