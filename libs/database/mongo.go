package database

import (
	"context"
	"time"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	databaseName                = "quip"
	MongoConnectionURIConfigKey = "database.uri"
)

// Creates a new MongoDB Client connected to the specified connection URI.
// Remember to call Disconnect when closing.
func newClient(cfg config.View) (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.GetString(MongoConnectionURIConfigKey)).SetDirect(true))
	if err != nil {
		return nil, errors.Wrap(err, "mongo.Connect failed")
	}

	return client, nil
}
