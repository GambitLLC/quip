package e2e_test

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"testing"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/magiclabs/magic-admin-go/token"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
	"github.com/GambitLLC/quip/libs/test/data"
)

// start spins up all matchmaker services in memory for the duration of the test.
func start(t *testing.T) config.View {
	cfg := viper.New()
	_ = statestoreTesting.NewService(t, cfg)
	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{apptest.ServiceName, "matchmaker.frontend"}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	// set tls
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKeyFile", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

	// TODO: add cfg logging.level

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		frontend.BindService,
	)

	return cfg
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
