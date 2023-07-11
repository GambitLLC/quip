package e2e_test

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/GambitLLC/quip/libs/matchmaker/inmemory"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/magiclabs/magic-admin-go/token"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

// inmemory package expects working directory to be at root of project ('/quip')
func init() {
	_, filename, _, _ := runtime.Caller(0)
	idx := strings.LastIndex(filename, "quip")
	if idx == -1 {
		panic("expected to be in folder named 'quip'")
	}

	dir := filename[:idx+4]
	err := os.Chdir(dir)
	if err != nil {
		panic(err)
	}
}

var cfg *viper.Viper

func TestMain(m *testing.M) {
	cfg = viper.New()
	proc, err := inmemory.Start(cfg)
	if err != nil {
		panic(err)
	}

	code := m.Run()
	proc.Kill()
	if err := proc.Wait(); err != nil {
		panic(err)
	}

	os.Exit(code)
}

func newContext(t *testing.T) context.Context {
	return context.Background()
}

// createDidToken returns an arbitrary DID Token and the associated id
func createDidToken(t *testing.T) (string, string) {
	privKey, err := crypto.GenerateKey()
	require.NoError(t, err, "GenerateKey failed")
	addr := crypto.PubkeyToAddress(privKey.PublicKey)

	claimObj := token.Claim{
		Iat: time.Now().Unix(),
		Ext: time.Now().Add(10 * time.Minute).Unix(),
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
	return didToken, claimObj.Iss
}
