package model

import (
	"encoding/json"
	"io"

	"github.com/mitchellh/mapstructure"
)

type Date struct {
	Year  int `json:"year"`
	Month int `json:"month"`
	Day   int `json:"day"`
}

// UnmarshalGQL implements the graphql.Unmarshaler interface
func (d *Date) UnmarshalGQL(v interface{}) error {
	return mapstructure.Decode(v, d)
}

// MarshalGQL implements the graphql.Marshaler interface
func (d Date) MarshalGQL(w io.Writer) {
	err := json.NewEncoder(w).Encode(d)
	if err != nil {
		panic(err)
	}
}
