package config

import (
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

// FileCacher is a Cacher that detects whenever the config file changes at all.
type FileCacher struct {
	filename    string
	cfg         *viper.Viper
	newInstance NewInstanceFunc
	m           sync.Mutex

	clean bool
	v     interface{}
	c     func()
}

func NewFileCacher(filename string, newInstance NewInstanceFunc) *FileCacher {
	c := &FileCacher{
		filename:    filename,
		newInstance: newInstance,
	}

	return c
}

func (c *FileCacher) Get() (interface{}, error) {
	c.m.Lock()
	defer c.m.Unlock()

	if c.cfg == nil {
		cfg, err := ReadFile(c.filename)
		if err != nil {
			return nil, err
		}

		cfg.WatchConfig()
		cfg.OnConfigChange(func(in fsnotify.Event) {
			log.Debug().Str("operation", in.Op.String()).Str("filename", in.Name).Msg("Cached config file changed")

			c.m.Lock()
			defer c.m.Unlock()

			c.clean = false
		})

		c.cfg = cfg
	}

	if !c.clean {
		c.locklessReset()

		var err error
		c.v, c.c, err = c.newInstance(c.cfg)
		if err != nil {
			c.locklessReset()
			return nil, err
		}

		c.clean = true
	}

	return c.v, nil
}

// ForceReset causes FileCacher to forget the cached object.  The next call to Get
// will again use newInstance to create a new object.
func (c *FileCacher) ForceReset() {
	c.m.Lock()
	defer c.m.Unlock()
	c.locklessReset()
}

func (c *FileCacher) locklessReset() {
	if c.c != nil {
		c.c()
	}
	c.c = nil
	c.v = nil
}
