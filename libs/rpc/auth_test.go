package rpc

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/oauth"
	"google.golang.org/grpc/interop/grpc_testing"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/test/data"
)

func TestAuth(t *testing.T) {
	cfg := viper.New()
	cfg.Set("test.hostname", "localhost")
	cfg.Set("test.port", 44483)
	cfg.Set(serverPublicCertificateFileConfigKey, data.Path("x509/server_cert.pem"))
	cfg.Set(serverPrivateKeyFileConfigKey, data.Path("x509/server_key.pem"))
	cfg.Set(serverRootCertificatePathConfigKey, data.Path("x509/ca_cert.pem"))

	params, err := NewServerParams(cfg, "test")
	require.NoError(t, err, "NewServerParams failed")

	params.AddHandler(func(s *grpc.Server) {
		grpc_testing.RegisterTestServiceServer(s, &TestService{})
	})

	params.SetAuth(func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		token := strings.TrimPrefix(metautils.ExtractIncoming(ctx).Get("authorization"), "Bearer ")

		if token == "" {
			return nil, status.Error(codes.Unauthenticated, "missing authorization metadata")
		}

		// TODO: actually validate the access token
		if token != "valid token" {
			return nil, status.Error(codes.PermissionDenied, "invalid token")
		}

		return handler(ctx, req)
	})

	server := Server{}

	err = server.Start(params)
	require.NoError(t, err, "start server failed")

	t.Cleanup(func() {
		if err := server.Stop(); err != nil {
			t.Errorf("stop server failed: %s", err.Error())
		}
	})

	conn, err := GRPCClientFromConfig(cfg, "test")
	require.NoError(t, err, "create grpc client failed")

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := grpc_testing.NewTestServiceClient(conn)

	// test invalid call
	_, err = client.EmptyCall(ctx, &grpc_testing.Empty{})
	require.Error(t, err, "call should have failed")
	require.Equal(t, codes.Unauthenticated, status.Code(err), "should have received codes.Unauthenticated")

	// Test unauthorized call
	_, err = client.EmptyCall(ctx, &grpc_testing.Empty{}, grpc.PerRPCCredentials(
		oauth.TokenSource{
			TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
				AccessToken: "invalid token",
			}),
		},
	))
	require.Error(t, err, "call should have failed")
	require.Equal(t, codes.PermissionDenied, status.Code(err), "should have received codes.PermissionDenied")

	// Test valid call
	_, err = client.EmptyCall(ctx, &grpc_testing.Empty{}, grpc.PerRPCCredentials(
		oauth.TokenSource{
			TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
				AccessToken: "valid token",
			}),
		},
	))
	require.NoError(t, err, "call should not have failed")
}

type TestService struct {
	grpc_testing.UnimplementedTestServiceServer
}

// One empty request followed by one empty response.
func (s *TestService) EmptyCall(_ context.Context, _ *grpc_testing.Empty) (*grpc_testing.Empty, error) {
	return &grpc_testing.Empty{}, nil
}
