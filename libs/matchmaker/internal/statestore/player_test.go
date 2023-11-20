package statestore

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/libs/test"
)

func TestTicketId(t *testing.T) {
	svc := newService(t)
	ctx, cancel := context.WithTimeout(test.NewContext(t), 5*time.Second)
	defer cancel()

	id := uuid.NewString()

	tid, _, err := svc.GetPlayer(ctx, id)
	require.NoError(t, err, "GetPlayer failed")
	require.Empty(t, tid, "ticket id should be empty")

	newTid := uuid.NewString()
	b, err := svc.SetTicketId(ctx, newTid, []string{id})
	require.NoError(t, err, "SetTicketId failed")
	require.True(t, b, "SetTicketId returned false")

	tid, _, err = svc.GetPlayer(ctx, id)
	require.NoError(t, err, "GetPlayer failed")
	require.Equal(t, newTid, tid, "ticket id should have updated")

	err = svc.UnsetTicketId(ctx, []string{id})
	require.NoError(t, err, "UnsetTicketId failed")

	tid, _, err = svc.GetPlayer(ctx, id)
	require.NoError(t, err, "GetPlayer failed")
	require.Empty(t, tid, "ticket id should be empty")
}

func newService(t *testing.T) Service {
	cfg := viper.New()
	test.NewRedis(t, cfg)

	return New(cfg)
}
