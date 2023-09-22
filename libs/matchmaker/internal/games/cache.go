package games

import (
	"os"
	"path/filepath"
	"sync"

	"github.com/fsnotify/fsnotify"
)

type newInstanceFunc func(bs []byte) (obj interface{}, close func(), err error)

// fileCacher is used to cache the construction of some object using a file.
// It will watch the file for changes and return the new object when changed.
type fileCacher struct {
	filename    string
	newInstance newInstanceFunc
	m           sync.Mutex

	v            interface{}
	close        func()
	onFileChange func(fsnotify.Event)
}

func newFileCacher(filename string, newInstance newInstanceFunc) *fileCacher {
	cacher := &fileCacher{
		filename:    filename,
		newInstance: newInstance,
	}

	cacher.watchFile()

	return cacher
}

func (c *fileCacher) Get() (interface{}, error) {
	c.m.Lock()
	defer c.m.Unlock()

	if c.v == nil {
		c.locklessReset()

		bs, err := os.ReadFile(c.filename)
		if err != nil {
			return nil, err
		}
		c.v, c.close, err = c.newInstance(bs)
		if err != nil {
			c.locklessReset()
			return nil, err
		}
	}

	return c.v, nil
}

func (c *fileCacher) ForceReset() {
	c.m.Lock()
	defer c.m.Unlock()
	c.locklessReset()
}

func (c *fileCacher) OnFileChange(f func(fsnotify.Event)) {
	c.onFileChange = f
}

func (c *fileCacher) locklessReset() {
	if c.close != nil {
		c.close()
	}
	c.close = nil
	c.v = nil
}

func (c *fileCacher) watchFile() {
	wg := sync.WaitGroup{}
	wg.Add(1)
	go func() {
		watcher, err := fsnotify.NewWatcher()
		if err != nil {
			panic("failed to create new file watcher")
		}
		defer watcher.Close()

		file := filepath.Clean(c.filename)
		dir, _ := filepath.Split(file)
		// TODO: handle err?
		realFile, _ := filepath.EvalSymlinks(c.filename)

		watcherWg := sync.WaitGroup{}
		watcherWg.Add(1)
		go func() {
			defer watcherWg.Done()
			for {
				select {
				case event, ok := <-watcher.Events:
					if !ok {
						// Events channel closed
						return
					}

					currFile, _ := filepath.EvalSymlinks(c.filename)
					// watch file for the following events:
					// 1. file was created or modified
					// 2. real path to file was changed (e.g. k8s config map replacement)
					if (filepath.Clean(event.Name) == file &&
						(event.Has(fsnotify.Create) || event.Has(fsnotify.Write))) ||
						(currFile != "" && currFile != realFile) {
						realFile = currFile

						c.m.Lock()
						c.v = nil
						c.m.Unlock()

						if c.onFileChange != nil {
							c.onFileChange(event)
						}

					} else if filepath.Clean(event.Name) == file && event.Has(fsnotify.Remove) {
						return
					}

				case err, ok := <-watcher.Errors:
					if !ok {
						// Error channel closed
						return
					}
					// TODO: handle err
					_ = err
				}
			}
		}()

		watcher.Add(dir)
		wg.Done()        // done initializing
		watcherWg.Wait() // wait for watcher loop to end in this goroutine
	}()

	// wait for watcher to finish initializing
	wg.Wait()
}
