package config

import (
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

// FileCacher is used to cache the construction of an object, but detects when
// the entire file is changed.
type FileCacher struct {
	cfg         *viper.Viper
	newInstance NewInstanceFunc
	m           sync.Mutex

	clean bool
	v     interface{}
	c     func()
}

func NewFileCacher(name string, newInstance NewInstanceFunc) (*FileCacher, error) {
	cfg, err := ReadFile(name)
	if err != nil {
		return nil, err
	}

	c := &FileCacher{
		cfg:         cfg,
		newInstance: newInstance,
	}

	cfg.OnConfigChange(func(in fsnotify.Event) {
		c.m.Lock()
		defer c.m.Unlock()

		c.clean = false
	})

	return c, nil
}

func (c *FileCacher) Get() (interface{}, error) {
	c.m.Lock()
	defer c.m.Unlock()

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

// ForceReset causes Cacher to forget the cached object.  The next call to Get
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
