package frontend

import (
	"context"
	"fmt"
	"strings"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/auth"
	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterFrontendServer(s, service)
	})
	b.AddCloser(service.broker.Close)
	b.AddCloser(service.store.Close)
	b.SetAuth(func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		md := metautils.ExtractIncoming(ctx)
		didToken := strings.TrimPrefix(md.Get("authorization"), "Bearer ")

		if didToken == "" {
			return nil, status.Error(codes.Unauthenticated, "missing authorization metadata")
		}

		token, err := auth.ValidateMagicDIDToken(didToken)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, fmt.Sprintf("invalid authorization token: %s", err.Error()))
		}

		// TODO: validate audience

		md = md.Set("Player-Id", token.GetIssuer())
		return handler(md.ToIncoming(ctx), req)
	})

	return nil
}
