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

	"github.com/GambitLLC/quip/internal/appmain/apptest"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/matchmaker/director"
	"github.com/GambitLLC/quip/internal/matchmaker/frontend"
	"github.com/GambitLLC/quip/internal/matchmaker/manager"
	"github.com/GambitLLC/quip/internal/matchmaker/matchfunction"
	"github.com/GambitLLC/quip/internal/rpc"
	"github.com/GambitLLC/quip/internal/test"
	"github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

const TestTimeout = 60 * time.Second

// start spins up all matchmaker services in memory for the duration of the test.
func start(t *testing.T) (config.View, *test.AgonesAllocationService) {
	cfg := viper.New()

	test.SetTLS(cfg)
	test.NewRedis(t, cfg)
	test.NewGamesFile(t, cfg, nil)
	test.NewOpenMatch(t, cfg)

	// spin up server for the rest of the services
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"matchmaker.frontend",
		"matchmaker.manager",
		"matchmaker.matchfunction",
		"agones",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	agonesAllocSvc := test.NewAgonesAllocationService(t, cfg)

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		frontend.BindService,
		manager.BindService,
		matchfunction.BindService,
		agonesAllocSvc.Bind,
	)

	// start up director as well
	apptest.TestDaemon(t, cfg, director.New)

	return cfg, agonesAllocSvc
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

func newFrontendClient(t *testing.T, cfg config.View) (client pb.QuipFrontendClient, id string) {
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
	return pb.NewQuipFrontendClient(conn), id
}

func recvStream(t *testing.T, ctx context.Context, stream pb.QuipFrontend_ConnectClient) <-chan *pb.PlayerUpdate {
	resps := make(chan *pb.PlayerUpdate, 1)
	go func() {
		for {
			msg, err := stream.Recv()
			if err == io.EOF {
				return
			}

			// ignore context cancelled and deadline exceeded: cancel occurs when test is done
			// and deadline exceeded is handled in test case functions
			if err != nil && ctx.Err() == nil {
				t.Error(err)
			}

			// t.Log("recv'd msg: ", msg)
			resps <- msg
		}
	}()

	return resps
}

type testAction func(
	t *testing.T,
	ctx context.Context,
	id string,
	client pb.QuipFrontendClient,
	updates <-chan *pb.PlayerUpdate,
	agones *test.AgonesAllocationService,
	memo map[string]any,
)

func getPlayerRequest(check func(p *pb.Player, err error, id string, memo map[string]any)) testAction {
	return func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate, agones *test.AgonesAllocationService, memo map[string]any) {
		player, err := client.GetPlayer(ctx, &pb.GetPlayerRequest{})
		check(player, err, id, memo)
	}
}

func startQueueRequest(req *pb.StartQueueRequest, check func(err error, id string, memo map[string]any)) testAction {
	return func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate, agones *test.AgonesAllocationService, memo map[string]any) {
		_, err := client.StartQueue(ctx, req)
		check(err, id, memo)
	}
}

func stopQueueRequest(check func(err error, id string, memo map[string]any)) testAction {
	return func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate, agones *test.AgonesAllocationService, memo map[string]any) {
		_, err := client.StopQueue(ctx, &pb.StopQueueRequest{})
		check(err, id, memo)
	}
}

func expectUpdate(check func(p *pb.PlayerUpdate, id string, memo map[string]any)) testAction {
	return func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate, agones *test.AgonesAllocationService, memo map[string]any) {
		select {
		case <-ctx.Done():
			require.FailNow(t, "test timed out waiting for response")
		case resp, ok := <-updates:
			if !ok {
				require.FailNow(t, "client response stream closed")
			}

			check(resp, id, memo)
		}
	}
}
