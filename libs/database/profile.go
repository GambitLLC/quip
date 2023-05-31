package database

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/GambitLLC/quip/libs/config"
)

const (
	profileCollection = "profiles"
)

type Profile struct {
	ID          string `bson:"_id,omitempty"`
	DisplayName string `bson:"display_name"`
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
	// https://stackoverflow.com/questions/53110020/mongodb-go-driver-bson-struct-to-bson-document-encoding
	// conversion of structs to bson Documents currently not supported ...
	// must manually fill out the fields
	// TODO: consider update just taking in a map of changes?
	_, err := s.collection.UpdateByID(
		ctx,
		profile.ID,
		bson.D{

			{Key: "$set", Value: bson.M{"display_name": profile.DisplayName}},
		},
		options.Update().SetUpsert(true),
	)

	return err
}
