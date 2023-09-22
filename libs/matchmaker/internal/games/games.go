package games

import "encoding/json"

// GameListing is a map of gamemode names to GameDetails
type GameListing map[string]GameDetails

// GameDetails contains the information about a gamemode that is needed for
// Open Match (matchfunction) to create matches.
type GameDetails struct {
	TeamCount uint32 `json:"teamCount,omitempty"`
	TeamSize  uint32 `json:"teamSize,omitempty"`
}

type GameListingCache struct {
	*fileCacher
}

func NewGameListingCache(filename string) *GameListingCache {
	newInstance := func(bs []byte) (obj interface{}, close func(), err error) {
		obj = GameListing{}
		err = json.Unmarshal(bs, &obj)
		return
	}

	return &GameListingCache{
		fileCacher: newFileCacher(filename, newInstance),
	}
}

func (c *GameListingCache) Get() (GameListing, error) {
	obj, err := c.fileCacher.Get()
	if err != nil {
		return nil, err
	}
	return obj.(GameListing), nil
}
