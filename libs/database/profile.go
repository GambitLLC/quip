package database

import (
	"context"

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
	res := s.collection.FindOne(ctx, bson.D{{Key: "_id", Value: id}})

	profile := &Profile{}
	if err := res.Decode(profile); err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *ProfileService) UpdateProfile(ctx context.Context, profile Profile) error {
	var changes bson.M
	if err := mapstructure.Decode(profile, &changes); err != nil {
		return err
	}

	_, err := s.collection.UpdateByID(
		ctx,
		profile.Id,
		bson.D{
			{Key: "$set", Value: changes},
		},
		options.Update().SetUpsert(true),
	)

	return err
}
