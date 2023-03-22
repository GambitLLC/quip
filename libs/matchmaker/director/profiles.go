package director

import (
	"fmt"

	"github.com/pkg/errors"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
)

type profileCache struct {
	cacher config.Cacher
}

func newProfileCache(cfg config.View) *profileCache {
	newInstance := func(cfg config.View) (interface{}, func(), error) {
		games, ok := cfg.Get("games").(map[string]interface{})
		if !ok {
			return nil, nil, errors.New("failed to read 'games' from config")
		}

		profiles := make([]*ompb.MatchProfile, 0, len(games))
		for name, details := range games {
			details, ok := details.(map[string]interface{})
			if !ok {
				return nil, nil, errors.Errorf("config value games.%s is malformed: should be map", name)
			}

			// TODO: create profile extensions from game details
			_ = details

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
			})
		}

		return profiles, nil, nil
	}

	return &profileCache{
		cacher: config.NewFileCacher("games", newInstance),
	}
}

func (c *profileCache) Profiles() ([]*ompb.MatchProfile, error) {
	profiles, err := c.cacher.Get()
	if err != nil {
		return nil, err
	}

	return profiles.([]*ompb.MatchProfile), nil
}
