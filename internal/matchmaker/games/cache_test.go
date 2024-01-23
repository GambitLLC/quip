package games

import (
	"bytes"
	"crypto/rand"
	"os"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"
	"github.com/stretchr/testify/require"
)

func TestWatchFile(t *testing.T) {
	f, err := os.CreateTemp("", "watched")
	require.NoError(t, err, "os.CreateTemp failed")
	defer os.Remove(f.Name())

	cacher := newFileCacher(f.Name(), func(bs []byte) (obj interface{}, close func(), err error) {
		return bs, nil, nil
	})

	changed := make(chan struct{}, 1)
	cacher.OnFileChange(func(e fsnotify.Event) {
		close(changed)
	})

	obj, err := cacher.Get()
	require.NoError(t, err, "cacher.Get failed")
	require.True(t, bytes.Equal([]byte{}, obj.([]byte)), "initial obj should be empty")

	content := make([]byte, 10)
	_, err = rand.Read(content)
	require.NoError(t, err, "rand.Read failed")

	_, err = f.Write(content)
	require.NoError(t, err, "f.Write failed")

	select {
	case <-changed:
	case <-time.After(3 * time.Second):
		require.FailNow(t, "test timed out waiting for change")
	}

	obj, err = cacher.Get()
	require.NoError(t, err, "cacher.Get failed")
	require.True(t, bytes.Equal(content, obj.([]byte)), "watcher should give new obj")
}
