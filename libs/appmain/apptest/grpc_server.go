package apptest

import (
	"fmt"
	"net"
	"testing"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/stretchr/testify/require"
)

const ServiceName = "test"

// TestGRPCService binds grpc services for testing. Listeners are passed in so that arbitrary ports
// can be used. Remember to set appropriate values in the cfg passed in.
func TestGRPCService(t *testing.T, cfg config.View, lns []net.Listener, binds ...appmain.BindGRPC) {
	lm, err := newListenerManager(lns)
	require.NoError(t, err, "newListenerManager failed")

	svc, err := appmain.NewGRPCService(ServiceName, cfg, bindAll(binds), lm.listen)
	require.NoError(t, err, "appmain.NewGRPCService failed")

	t.Cleanup(func() {
		err := svc.Stop()
		require.NoError(t, err, "svc.Stop failed")
	})
}

func bindAll(binds []appmain.BindGRPC) appmain.BindGRPC {
	return func(v config.View, g *appmain.GRPCBindings) error {
		for _, bind := range binds {
			err := bind(v, g)
			if err != nil {
				return err
			}
		}
		return nil
	}
}

type listenerManager struct {
	ls map[string]net.Listener
}

func newListenerManager(ls []net.Listener) (*listenerManager, error) {
	lm := &listenerManager{
		ls: make(map[string]net.Listener, len(ls)),
	}

	for _, l := range ls {
		addr, err := fullAddr(l.Addr().Network(), l.Addr().String())
		if err != nil {
			return nil, err
		}

		lm.ls[addr] = l
	}

	return lm, nil
}

func (lm *listenerManager) listen(network, address string) (net.Listener, error) {
	addr, err := fullAddr(network, address)
	if err != nil {
		return nil, err
	}

	l, ok := lm.ls[addr]
	if !ok {
		return nil, fmt.Errorf("listener for \"%s\" not passed to TestService or already used", address)
	}
	delete(lm.ls, addr)

	return l, nil
}

func fullAddr(network, address string) (string, error) {
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return "", err
	}

	// Simplify unspecified hosts because listeners may return different forms
	if net.ParseIP(host).IsUnspecified() {
		host = ""
	}

	return fmt.Sprintf("%s://%s:%s", network, host, port), nil
}
