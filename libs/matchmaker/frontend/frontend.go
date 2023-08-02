package frontend

import (
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
	"github.com/GambitLLC/quip/libs/rpc"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := NewService(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterFrontendServer(s, service)
	})
	// b.AddCloser(service.broker.Close)
	b.AddCloser(service.store.Close)
	b.AddStreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if info.FullMethod != pb.Frontend_Stream_FullMethodName {
			return handler(srv, ss)
		}

		md := metautils.ExtractIncoming(ss.Context())
		didToken := strings.TrimPrefix(md.Get("authorization"), "Bearer ")

		if didToken == "" {
			return status.Error(codes.Unauthenticated, "missing authorization metadata")
		}

		token, err := auth.ValidateMagicDIDToken(didToken)
		if err != nil {
			return status.Errorf(codes.Unauthenticated, fmt.Sprintf("invalid authorization token: %s", err.Error()))
		}

		// TODO: validate audience

		md = md.Set("Player-Id", token.GetIssuer())
		ctx := md.ToIncoming(ss.Context())

		return handler(srv, &rpc.WrappedStream{
			ServerStream: ss,
			Ctx:          ctx,
		})
	})

	return nil
}
