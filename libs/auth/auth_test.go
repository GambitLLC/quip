package auth

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/magiclabs/magic-admin-go/token"
	"github.com/stretchr/testify/require"
)

func TestGenerateToken(t *testing.T) {
	didToken := createDidToken(t)

	token, err := ValidateMagicDIDToken(didToken)
	require.NoError(t, err, "validate did token failed")
	t.Logf("%+v", token)
}

func createDidToken(t *testing.T) string {
	privKey, err := crypto.GenerateKey()
	require.NoError(t, err, "GenerateKey failed")
	addr := crypto.PubkeyToAddress(privKey.PublicKey)

	claimObj := token.Claim{
		Iat: time.Now().Unix(),
		Ext: time.Now().Add(1 * time.Minute).Unix(),
		Iss: fmt.Sprintf("did:ethr:%s", addr.String()),
	}

	jsonClaim, err := json.Marshal(claimObj)
	require.NoError(t, err, "marshal claim failed")

	claimHash := crypto.Keccak256Hash([]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(jsonClaim), jsonClaim)))
	proof, err := crypto.Sign(claimHash.Bytes(), privKey)
	require.NoError(t, err, "sign claim failed")
	// crypto.Sign returns V = 0 or 1, validator excepts 27/28
	if proof[64] == 0 || proof[64] == 1 {
		proof[64] += 27
	}

	marshaledToken, err := json.Marshal([]string{hexutil.Encode(proof), string(jsonClaim)})
	require.NoError(t, err, "marshal token failed")

	didToken := base64.URLEncoding.EncodeToString(marshaledToken)
	return didToken
}
