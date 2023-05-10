package auth

import (
	"testing"

	"github.com/stretchr/testify/require"
)

const didToken = `WyIweDhiYzQ0YzIxZjQ0OWJkZmVmNDU0YmY2Y2NhOGU5MDhjNmU0NjRkMjFhZjk1MmFjNjgwZTU4ZGQ2NTEzYTQxN2QyYmI0Njg4ZTAwNzAxYWQ5NTMyY2MxMTc1MjUzZGY2ZjZiNjZjY2Y5NDU3N2M0Y2JkMmM3NDUxN2U2NWQ2MmFjMWIiLCJ7XCJpYXRcIjoxNjgzNzUzNjQ1LFwiZXh0XCI6MTY4Mzc1NDU0NSxcImlzc1wiOlwiZGlkOmV0aHI6MHhkOTE4NTQzNTVjNUJFRTBlRjNEZEE3MUU5RTc3YjE5YUE2MjM0MTRmXCIsXCJzdWJcIjpcInQ0UFVqWGpUOTA1QjFIMllHd1pBS2FDYlpvdG1EOU5Nd1NzeWFkVlFiX3c9XCIsXCJhdWRcIjpcIkE1UTJ4QjdPMS1HYWl2aGN3TTZBMnZVWjZtbzhpNUxfNGNpYjlyVjBHMjg9XCIsXCJuYmZcIjoxNjgzNzUzNjQ1LFwidGlkXCI6XCIzZWQxYjkxNi1kY2FiLTRhZmMtYTUzMC00ZmViNmE2N2YyN2ZcIixcImFkZFwiOlwiMHgwMDc4MTNlMWUyZDZhYTMzZTQ5MzljYjkyZGE1YzMyYTIxZDJlMzNjMTczZmJkODM2MjhjZjI5N2FiZDY0MmM4N2RlZDg0Yzg5ODg0MWVkZDJhMTdjZjZiNDMzZDFjODE1NWFiNjVjMmU1NTMxNDViNjY3NjZlY2NhZjQ5YjY0YzFiXCJ9Il0=`

func TestToken(t *testing.T) {
	token, err := ValidateMagicDIDToken(didToken)
	require.NoError(t, err)

	t.Logf("%+v", token)
	t.Logf("iss: %s", token.GetIssuer())
	s, err := token.GetPublicAddress()
	require.NoError(t, err, "get public address failed")
	t.Logf("addr: %s", s)
}
