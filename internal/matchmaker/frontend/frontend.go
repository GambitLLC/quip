package frontend

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/auth"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/rpc"
	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
)

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterQuipFrontendServer(s, service)
	})
	b.AddCloser(service.Close)
	b.AddUnaryInterceptor(func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		if info.FullMethod != pb.QuipFrontend_GetPlayer_FullMethodName && info.FullMethod != pb.QuipFrontend_StartQueue_FullMethodName && info.FullMethod != pb.QuipFrontend_StopQueue_FullMethodName {
			return handler(ctx, req)
		}

		md := metautils.ExtractIncoming(ctx)
		token := strings.TrimPrefix(md.Get("authorization"), "Bearer ")

		if token == "" {
			return nil, status.Error(codes.Unauthenticated, "missing authorization metadata")
		}

		didToken, err := auth.ValidateMagicDIDToken(token)
		if err != nil {
			return nil, status.Errorf(codes.Unauthenticated, fmt.Sprintf("invalid authorization token: %s", err.Error()))
		}

		playerId := didToken.GetIssuer()
		md.Set("Player-Id", playerId)

		return handler(md.ToIncoming(ctx), req)
	})
	b.AddStreamInterceptor(func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if info.FullMethod != pb.QuipFrontend_Connect_FullMethodName {
			return handler(srv, ss)
		}

		md := metautils.ExtractIncoming(ss.Context())
		token := strings.TrimPrefix(md.Get("authorization"), "Bearer ")

		if token == "" {
			return status.Error(codes.Unauthenticated, "missing authorization metadata")
		}

		didToken, err := auth.ValidateMagicDIDToken(token)
		if err != nil {
			return status.Errorf(codes.Unauthenticated, fmt.Sprintf("invalid authorization token: %s", err.Error()))
		}

		playerId := didToken.GetIssuer()
		md.Set("Player-Id", playerId)

		return handler(srv, &rpc.WrappedStream{
			ServerStream: ss,
			Ctx:          md.ToIncoming(ss.Context()),
		})
	})

	return nil
}
