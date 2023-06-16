package model

// Create User struct here to gqlgen to bind to
// Only ID is included from id/access token -- all other fields need resolvers
type User struct {
	ID string `json:"id"`
}
