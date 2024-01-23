package database

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/mitchellh/mapstructure"
)

const (
	profileCollection = "profiles"
)

type Profile struct {
	Id          string `bson:"_id,omitempty" mapstructure:"_id,omitempty"`
	DisplayName string `mapstructure:"displayName,omitempty"`
}

type ProfileService struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func NewProfileService(cfg config.View) (*ProfileService, error) {
	client, err := newClient(cfg)
	if err != nil {
		return nil, err
	}
	return &ProfileService{
		client:     client,
		collection: (*mongo.Collection)(client.Database(databaseName).Collection(profileCollection)),
	}, nil
}

func (s *ProfileService) Close() error {
	return s.client.Disconnect(context.Background())
}

func (s *ProfileService) GetProfile(ctx context.Context, id string) (*Profile, error) {
	res := s.collection.FindOne(ctx, bson.M{"_id": id})

	profile := &Profile{}
	if err := res.Decode(profile); err != nil {
		return nil, err
	}

	return profile, nil
}

// UpdateProfile overwrites the set fields on profile with the given Id.
// Takes in Profile instead of a map of changes to ensure arbitrary fields are not added.
func (s *ProfileService) UpdateProfile(ctx context.Context, profile Profile) error {
	if profile.Id == "" {
		return errors.New("Profile.Id is unspecified")
	}

	var changes bson.M
	if err := mapstructure.Decode(profile, &changes); err != nil {
		return err
	}
	// _id shouldn't be a part of changes
	delete(changes, "_id")

	_, err := s.collection.UpdateByID(
		ctx,
		profile.Id,
		bson.M{
			"$set": changes,
		},
		options.Update().SetUpsert(true),
	)

	return err
}
