package database

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestFindNonexistentProfile(t *testing.T) {
	service, err := NewProfileService(cfg)
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, service.Close())
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	profile, err := service.GetProfile(ctx, "nonexistent id")
	require.Error(t, err)
	require.Nil(t, profile)
}

func TestInsertProfile(t *testing.T) {
	service, err := NewProfileService(cfg)
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, service.Close())
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := primitive.NewObjectID().Hex()
	name := fmt.Sprintf("test-profile-%s", id)
	err = service.UpdateProfile(ctx, Profile{
		Id:          id,
		DisplayName: name,
	})
	require.NoError(t, err, "UpdateProfile failed")

	profile, err := service.GetProfile(ctx, id)
	require.NoError(t, err, "GetProfile failed")
	require.Equal(t, name, profile.DisplayName, "Retrieved profile's display name does not match provided name")

	// Update without fields should not have changed profile
	err = service.UpdateProfile(ctx, Profile{
		Id: id,
	})
	require.NoError(t, err, "UpdateProfile again failed")

	newProfile, err := service.GetProfile(ctx, id)
	require.NoError(t, err, "GetProfile again failed")
	require.Equal(t, profile, newProfile, "Retrieved profile does not match original document")
}
