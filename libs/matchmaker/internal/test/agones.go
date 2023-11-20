package test

import (
	"context"
	"testing"
	"time"

	pb "agones.dev/agones/pkg/allocation/go"
	agonessdk "agones.dev/agones/pkg/sdk"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/sdk"
	"github.com/pkg/errors"
)

type AgonesAllocationService struct {
	pb.UnimplementedAllocationServiceServer

	t   *testing.T
	cfg config.View
	sdk *AgonesSDKServer
}

func NewAgonesAllocationService(t *testing.T, cfg config.View, sdk *AgonesSDKServer) *AgonesAllocationService {
	return &AgonesAllocationService{
		cfg: cfg,
		sdk: sdk,
		t:   t,
	}
}

func (svc *AgonesAllocationService) Bind(cfg config.View, b *appmain.GRPCBindings) error {
	b.AddHandler(func(s *grpc.Server) {
		pb.RegisterAllocationServiceServer(s, svc)
	})
	return nil
}

func (s *AgonesAllocationService) Allocate(ctx context.Context, req *pb.AllocationRequest) (*pb.AllocationResponse, error) {
	md := req.GetMetadata()
	if md == nil {
		return nil, status.Error(codes.InvalidArgument, ".Metadata is required")
	}

	_, err := newGameserver(s.t, s.cfg)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create gameserver: %s", err)
	}

	select {
	case s.sdk.gs <- &agonessdk.GameServer{
		ObjectMeta: &agonessdk.GameServer_ObjectMeta{
			Annotations: md.Annotations,
			Labels:      md.Labels,
		},
		Status: &agonessdk.GameServer_Status{
			State:   "Allocated",
			Address: "localhost",
			Ports: []*agonessdk.GameServer_Status_Port{
				{
					Name: "game",
					Port: 25565,
				},
			},
		},
	}: // no-op
	default:
		s.t.Error("allocate failed to send gameserver data to sdk")
	}

	return &pb.AllocationResponse{
		Address: "localhost",
		Ports: []*pb.AllocationResponse_GameServerStatusPort{
			{
				Name: "game",
				Port: 25565,
			},
		},
	}, nil
}

type AgonesSDKServer struct {
	agonessdk.UnimplementedSDKServer

	t  *testing.T
	s  *grpc.Server
	gs chan *agonessdk.GameServer

	closed chan struct{}
}

func NewAgonesSDKServer(t *testing.T) *AgonesSDKServer {
	return &AgonesSDKServer{
		t:      t,
		gs:     make(chan *agonessdk.GameServer, 1),
		closed: make(chan struct{}, 1),
	}
}

// Bind must called be on a insecure gRPC server.
func (svc *AgonesSDKServer) Bind(cfg config.View, b *appmain.GRPCBindings) error {
	b.AddHandler(func(s *grpc.Server) {
		svc.s = s
		agonessdk.RegisterSDKServer(s, svc)
	})
	return nil
}

func (s *AgonesSDKServer) Shutdown(context.Context, *agonessdk.Empty) (*agonessdk.Empty, error) {
	close(s.closed)
	return &agonessdk.Empty{}, nil
}

func (s *AgonesSDKServer) WatchGameServer(_ *agonessdk.Empty, srv agonessdk.SDK_WatchGameServerServer) error {
	for {
		select {
		case <-s.closed:
			return nil
		case <-srv.Context().Done():
			return srv.Context().Err()
		case gs := <-s.gs:
			err := srv.Send(gs)
			if stat, ok := status.FromError(err); ok {
				switch stat.Code() {
				case codes.OK:
					// noop
				case codes.Canceled, codes.DeadlineExceeded:
					// client closed
					return nil
				default:
					s.t.Errorf("failed to send in WatchGameServer: %s", stat.Err())
				}
			} else {
				s.t.Errorf("failed to send in WatchGameServer: %s", stat.Err())
			}
		}
	}
}

type gameserver struct {
	t   *testing.T
	cfg config.View
	sdk *sdk.SDK
}

func newGameserver(t *testing.T, cfg config.View) (*gameserver, error) {
	gs := &gameserver{
		t:   t,
		cfg: cfg,
	}

	var err error
	gs.sdk, err = sdk.New(cfg, gs.onAllocated)
	if err != nil {
		return nil, err
	}

	return gs, nil
}

func (gs *gameserver) onAllocated(agonesgs *agonessdk.GameServer) {
	_, err := sdk.AgonesMatchDetails(agonesgs.GetObjectMeta())
	if err != nil {
		gs.t.Error(errors.WithMessage(err, "failed to get match details from agones sdk"))
		err := gs.sdk.Cancel(context.Background())
		if err != nil {
			gs.t.Error(errors.WithMessage(err, "failed to call sdk.Cancel"))
		}
	}

	<-time.After(1 * time.Second)
	err = gs.sdk.Finish(nil)
	if err != nil {
		gs.t.Error(errors.WithMessage(err, "failed to call sdk.Finish"))
	}
}
