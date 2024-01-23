package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/pkg/errors"

	"github.com/magiclabs/magic-admin-go/token"
)

func ValidateMagicDIDToken(didToken string) (*token.Token, error) {
	tk, err := token.NewToken(didToken)
	if err != nil {
		return nil, errors.WithMessagef(err, "malformed DID token")
	}

	// TODO: Get Client ID from somewhere else
	if err := tk.Validate(tk.GetClaim().Aud); err != nil {
		return nil, errors.WithMessagef(err, "invalid DID token")
	}

	return tk, nil
}

// contextKey type to prevent collisions
type contextKey string

var tokenContextKey contextKey = "didToken"
var userContextKey contextKey = "userId"

// ContextMiddleware retrieves the token from the Authorization header
// and puts the token as well as the user id into the request context.
// Does not perform token validation. Used for graphql resolvers.
func TokenContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")

		// ignore if token is not passed in -- websockets doesnt pass in token
		if token == "" {
			next.ServeHTTP(w, r)
			return
		}

		ctx, err := NewTokenContext(r.Context(), token)
		if err != nil {
			http.Error(w, fmt.Sprintf("{\"error\": {\"message\": \"%s\"}}", err.Error()), http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// NewTokenContext adds the given token and parsed user ID to the context.
// Does not validate the token but does parse the token for id.
func NewTokenContext(ctx context.Context, didToken string) (context.Context, error) {
	tk, err := token.NewToken(didToken)
	if err != nil {
		return nil, errors.WithMessagef(err, "malformed token")
	}

	ctx = context.WithValue(ctx, tokenContextKey, didToken)
	ctx = context.WithValue(ctx, userContextKey, tk.GetIssuer())

	return ctx, nil
}

// TokenFromContext retrieves the DIDToken from the context.
func TokenFromContext(ctx context.Context) string {
	token, _ := ctx.Value(tokenContextKey).(string)
	return token
}

// UserFromContext retrieves the User ID from the context.
func UserFromContext(ctx context.Context) string {
	id, _ := ctx.Value(userContextKey).(string)
	return id
}
