package config

import (
	"sync"
)

// Cacher is used to cache the construction of an object, such as a connection.
// It will detect which config values are read when constructing the object.
// Then, when further requests are made, it will return the same object as long
// as the config values which were used haven't changed.
type Cacher struct {
	cfg         View
	newInstance NewInstanceFunc
	m           sync.Mutex

	r *viewChangeDetector
	v interface{}
	c func()
}

// NewInstanceFunc is used by the cacher to create a new value given the config.
// It may return an additional function to close or otherwise cleanup if
// ForceReset is called.
type NewInstanceFunc func(cfg View) (interface{}, func(), error)

// NewCacher returns a cacher which uses cfg to detect relevant changes, and
// newInstance to construct the object when nessisary.  newInstance MUST use the
// provided View when constructing the object.
func NewCacher(cfg View, newInstance NewInstanceFunc) *Cacher {
	return &Cacher{
		cfg:         cfg,
		newInstance: newInstance,
	}
}

// Get returns the cached object if possible, otherwise it calls newInstance to
// construct the new cached object.  When Get is next called, it will detect if
// any of the configuration values which were used to construct the object have
// changed. If they have, the cache is invalidated, and a new object is
// constructed. If newInstance returns an error, Get returns that error and the
// object will not be cached or returned.
func (c *Cacher) Get() (interface{}, error) {
	c.m.Lock()
	defer c.m.Unlock()

	if c.r == nil || c.r.hasChanges() {
		c.locklessReset()

		c.r = newViewChangeDetector(c.cfg)
		var err error
		c.v, c.c, err = c.newInstance(c.r)
		if err != nil {
			c.locklessReset()
			return nil, err
		}
	}

	return c.v, nil
}

// ForceReset causes Cacher to forget the cached object.  The next call to Get
// will again use newInstance to create a new object.
func (c *Cacher) ForceReset() {
	c.m.Lock()
	defer c.m.Unlock()
	c.locklessReset()
}

func (c *Cacher) locklessReset() {
	if c.c != nil {
		c.c()
	}
	c.c = nil
	c.r = nil
	c.v = nil
}

// Remember each value as it is read, and can detect if a value has been changed
// since it was last read.
type viewChangeDetector struct {
	cfg       View
	isSet     map[string]bool
	getString map[string]string
	getInt    map[string]int
	getInt32  map[string]int32
	getInt64  map[string]int64
}

func newViewChangeDetector(cfg View) *viewChangeDetector {
	return &viewChangeDetector{
		cfg:       cfg,
		isSet:     make(map[string]bool),
		getString: make(map[string]string),
		getInt:    make(map[string]int),
		getInt32:  make(map[string]int32),
		getInt64:  make(map[string]int64),
	}
}

func (r *viewChangeDetector) IsSet(k string) bool {
	v := r.cfg.IsSet(k)
	r.isSet[k] = v
	return v
}

func (r *viewChangeDetector) GetString(k string) string {
	v := r.cfg.GetString(k)
	r.getString[k] = v
	return v
}

func (r *viewChangeDetector) GetInt(k string) int {
	v := r.cfg.GetInt(k)
	r.getInt[k] = v
	return v
}

func (r *viewChangeDetector) GetInt32(k string) int32 {
	v := r.cfg.GetInt32(k)
	r.getInt32[k] = v
	return v
}

func (r *viewChangeDetector) GetInt64(k string) int64 {
	v := r.cfg.GetInt64(k)
	r.getInt64[k] = v
	return v
}

func (r *viewChangeDetector) hasChanges() bool {
	for k, v := range r.isSet {
		if r.cfg.IsSet(k) != v {
			return true
		}
	}

	for k, v := range r.getString {
		if r.cfg.GetString(k) != v {
			return true
		}
	}

	for k, v := range r.getInt {
		if r.cfg.GetInt(k) != v {
			return true
		}
	}

	for k, v := range r.getInt64 {
		if r.cfg.GetInt64(k) != v {
			return true
		}
	}

	return false
}
