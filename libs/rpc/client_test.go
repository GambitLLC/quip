package rpc_test

import (
	"context"
	"crypto/tls"
	"net"
	"strings"
	"testing"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/oauth"
	"google.golang.org/grpc/interop/grpc_testing"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/test/data"
)

func TestAuthorization(t *testing.T) {
	cert, err := tls.LoadX509KeyPair(data.Path("x509/server_cert.pem"), data.Path("x509/server_key.pem"))
	require.NoError(t, err, "load key pair failed")

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "listen failed")

	server := grpc.NewServer(
		grpc.Creds(credentials.NewServerTLSFromCert(&cert)),
		grpc.UnaryInterceptor(func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
			token := strings.TrimPrefix(metautils.ExtractIncoming(ctx).Get("authorization"), "Bearer ")

			if token == "" {
				return nil, status.Error(codes.Unauthenticated, "missing authorization metadata")
			}

			// TODO: actually validate the access token
			if token != "valid token" {
				return nil, status.Error(codes.PermissionDenied, "invalid token")
			}

			return handler(ctx, req)
		}),
	)

	grpc_testing.RegisterTestServiceServer(server, &TestService{})

	go func() {
		err := server.Serve(ln)
		require.NoError(t, err, "serve failed")
	}()
	t.Cleanup(server.Stop)

	creds, err := credentials.NewClientTLSFromFile(data.Path("x509/ca_cert.pem"), "x.test.example.com")
	require.NoError(t, err, "load credentials failed")

	conn, err := grpc.Dial(
		ln.Addr().String(),
		grpc.WithTransportCredentials(creds),
	)
	require.NoError(t, err, "dial failed")

	// Test unauthenticated call
	client := grpc_testing.NewTestServiceClient(conn)
	_, err = client.EmptyCall(context.Background(), &grpc_testing.Empty{})
	require.Error(t, err, "call should have failed")
	require.Equal(t, codes.Unauthenticated, status.Code(err), "should have received codes.Unauthenticated")

	// Test unauthorized call
	_, err = client.EmptyCall(context.Background(), &grpc_testing.Empty{}, grpc.PerRPCCredentials(
		oauth.TokenSource{
			TokenSource: oauth2.StaticTokenSource(&oauth2.Token{
				AccessToken: "invalid token",
			}),
		},
	))
	require.Error(t, err, "call should have failed")
	require.Equal(t, codes.PermissionDenied, status.Code(err), "should have received codes.PermissionDenied")

	// Test valid call
	_, err = client.EmptyCall(context.Background(), &grpc_testing.Empty{}, grpc.PerRPCCredentials(
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
