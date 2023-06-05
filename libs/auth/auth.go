package auth

import (
	"context"
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

	if err := tk.Validate(); err != nil {
		return nil, errors.WithMessagef(err, "invalid DID token")
	}

	return tk, nil
}

// contextKey type to prevent collisions
type contextKey string

var tokenContextKey contextKey = "didToken"

// ContextMiddleware retrieves the token from the Authorization header
// and simply puts it into the request context. Used for graphql resolvers.
func TokenContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		next.ServeHTTP(w, r.WithContext(NewTokenContext(r.Context(), token)))
	})
}

// NewTokenContext adds the given token to the context.
func NewTokenContext(ctx context.Context, token string) context.Context {
	return context.WithValue(ctx, tokenContextKey, token)
}

// TokenFromContext retrieves the DIDToken from the context.
func TokenFromContext(ctx context.Context) string {
	token, _ := ctx.Value(tokenContextKey).(string)
	return token
}
