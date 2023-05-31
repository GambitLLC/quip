package database

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestInsertProfile(t *testing.T) {
	service, err := NewProfileService(cfg)
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, service.Close())
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := primitive.NewObjectID().Hex()
	name := fmt.Sprintf("arbitrary name - %s", id)
	err = service.UpdateProfile(ctx, Profile{
		ID:          id,
		DisplayName: name,
	})
	require.NoError(t, err)

	profile, err := service.GetProfile(ctx, id)
	require.NoError(t, err)
	require.Equal(t, name, profile.DisplayName)
}
