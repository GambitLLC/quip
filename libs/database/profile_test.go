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

func TestUpdateProfile(t *testing.T) {
	service, err := NewProfileService(cfg)
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, service.Close())
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := primitive.NewObjectID().Hex()
	name := fmt.Sprintf("test-profile-%s-%s", id, time.Now())

	t.Run("set display name", func(t *testing.T) {
		err = service.UpdateProfile(ctx, Profile{
			Id:          id,
			DisplayName: name,
		})
		require.NoError(t, err, "UpdateProfile failed")

		profile, err := service.GetProfile(ctx, id)
		require.NoError(t, err, "GetProfile failed")
		require.Equal(t, name, profile.DisplayName, "Retrieved profile's display name does not match provided name")
	})

	t.Run("should not unset fields", func(t *testing.T) {
		err = service.UpdateProfile(ctx, Profile{
			Id: id,
		})
		require.NoError(t, err, "UpdateProfile failed")

		profile, err := service.GetProfile(ctx, id)
		require.NoError(t, err, "GetProfile failed")
		require.NotEmpty(t, profile.DisplayName, "Retrieved profile does not have display name")
	})

	t.Run("should fail without id", func(t *testing.T) {
		err = service.UpdateProfile(ctx, Profile{
			DisplayName: name,
		})
		require.Error(t, err, "UpdateProfile should have failed")
	})
}
