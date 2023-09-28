package e2e_test

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"testing"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/magiclabs/magic-admin-go/token"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/oauth"

	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	"github.com/GambitLLC/quip/libs/matchmaker/manager"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	"github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
	"github.com/GambitLLC/quip/libs/test/data"
)

// start spins up all matchmaker services in memory for the duration of the test.
func start(t *testing.T) config.View {
	cfg := viper.New()
	test.NewRedis(t, cfg)
	test.NewGamesFile(t, cfg)

	// set tls
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKeyFile", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

	// spin up all services
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"matchmaker.frontend",
		"matchmaker.manager",
		"matchmaker.matchfunction",
		"openmatch.backend",
		"openmatch.frontend",
		"openmatch.query",
		"agones",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		frontend.BindService,
		manager.BindService,
		matchfunction.BindService,
		test.BindOpenMatchService,
		test.BindAgonesService,
	)

	// start up director as well
	apptest.TestDaemon(t, cfg, director.New)

	return cfg
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

func newFrontendClient(t *testing.T, cfg config.View) (client matchmaker.QuipFrontendClient, id string) {
	token, id := createDidToken(t)
	conn, err := rpc.GRPCClientFromService(
		cfg,
		"matchmaker.frontend",
		grpc.WithPerRPCCredentials(
			oauth.TokenSource{
				TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
					AccessToken: token,
				}),
			},
		),
	)
	require.NoError(t, err, "GRPCClientFromService failed")
	return matchmaker.NewQuipFrontendClient(conn), id
}

func recvStream(t *testing.T, ctx context.Context, stream matchmaker.QuipFrontend_ConnectClient) <-chan *matchmaker.Response {
	resps := make(chan *matchmaker.Response, 1)
	go func() {
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				return
			}

			if err != nil {
				t.Error(err)
			}

			resps <- msg
		}
	}()

	return resps
}
