package auth

import (
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
