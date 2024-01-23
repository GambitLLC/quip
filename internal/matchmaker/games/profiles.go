package games

import (
	"encoding/json"
	"fmt"

	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/internal/matchmaker/internal/protoext"
	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

type MatchProfileCache struct {
	*fileCacher
}

// NewGameListingCache reads a GameListing from filename as a JSON object
// and constructs Open Match profiles for every game.
// Will automatically update whenever filename is changed.
func NewMatchProfileCache(filename string) *MatchProfileCache {
	newInstance := func(bs []byte) (obj interface{}, close func(), err error) {
		listing := GameListing{}
		err = json.Unmarshal(bs, &listing)
		if err != nil {
			return
		}

		profiles := make([]*ompb.MatchProfile, 0, len(listing))
		for name, details := range listing {
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
			if err := protoext.SetExtensionDetails(profile, &pb.ProfileDetails{
				Gamemode: name,
				Teams:    details.TeamCount,
				Players:  details.TeamSize,
			}); err != nil {
				return nil, nil, err
			}

			profiles = append(profiles, profile)
		}

		return profiles, nil, nil
	}

	return &MatchProfileCache{
		fileCacher: newFileCacher(filename, newInstance),
	}
}

func (c *MatchProfileCache) Get() ([]*ompb.MatchProfile, error) {
	obj, err := c.fileCacher.Get()
	if err != nil {
		return nil, err
	}
	return obj.([]*ompb.MatchProfile), nil
}
