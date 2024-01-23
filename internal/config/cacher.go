package config

// Cacher is used to cache the construction of an object, such as a connection.
// It will detect which config values are read when constructing the object.
// Then, when further requests are made, it will return the same object as long
// as the config values which were used haven't changed.
type Cacher interface {
	// Get returns the cached object if possible, otherwise it calls newInstance to
	// construct the new cached object.  When Get is next called, it will detect if
	// any of the configuration values which were used to construct the object have
	// changed. If they have, the cache is invalidated, and a new object is
	// constructed. If newInstance returns an error, Get returns that error and the
	// object will not be cached or returned.
	Get() (interface{}, error)

	// ForceReset causes Cacher to forget the cached object.  The next call to Get
	// will again use newInstance to create a new object.
	ForceReset()
}

// NewInstanceFunc is used by the cacher to create a new value given the config.
// It may return an additional function to close or otherwise cleanup if
// ForceReset is called.
type NewInstanceFunc func(cfg View) (interface{}, func(), error)
