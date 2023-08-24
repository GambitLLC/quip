package test

import (
	"context"
	"testing"
)

type contextTestKey string

func NewContext(t *testing.T) context.Context {
	return context.WithValue(context.Background(), contextTestKey("testing.T"), t)
}
