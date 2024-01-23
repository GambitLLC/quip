package test

import (
	"context"
	"net"
	"sync"
	"testing"

	pb "agones.dev/agones/pkg/allocation/go"
	agonessdk "agones.dev/agones/pkg/sdk"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/appmain/apptest"
	"github.com/GambitLLC/quip/internal/config"
	"github.com/GambitLLC/quip/internal/sdk"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
)

type AgonesAllocationService struct {
	pb.UnimplementedAllocationServiceServer

	t   *testing.T
	cfg config.View

	servers sync.Map
}

func NewAgonesAllocationService(t *testing.T, cfg config.View) *AgonesAllocationService {
	return &AgonesAllocationService{
		cfg: cfg,
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

	err := s.createGameServer(s.t, s.cfg, md)
	if err != nil {
		return nil, err
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

func (s *AgonesAllocationService) GetGameserver(id string) *sdk.SDK {
	obj, ok := s.servers.Load(id)
	if !ok {
		return nil
	}

	sdk, _ := obj.(*sdk.SDK)
	return sdk
}

// Agones SDK relies on environment variable for connection: lock is necessary to
// ensure sdk connects to the correct server in case multiple sdks are created
// in parallel
var sdkCreationLock sync.Mutex

// createGameServer creates a new GameServer and agones SDK for the given test case
func (s *AgonesAllocationService) createGameServer(t *testing.T, cfg config.View, md *pb.MetaPatch) error {
	details, err := sdk.AgonesMatchDetails(md)
	if err != nil {
		return status.Error(codes.InvalidArgument, errors.WithMessage(err, "failed to parse match details from metadata").Error())
	}

	if details.GetMatchId() == "" {
		return status.Error(codes.InvalidArgument, "MatchId is not set in Metadata")
	}

	sdkCreationLock.Lock()
	defer sdkCreationLock.Unlock()

	createAgonesSDKServer(t, md)
	sdk, err := sdk.New(cfg, nil)
	if err != nil {
		return errors.WithMessage(err, "sdk.New failed")
	}

	s.servers.Store(details.GetMatchId(), sdk)
	return nil
}

type agonesSDKServer struct {
	agonessdk.UnimplementedSDKServer

	t  *testing.T
	md *pb.MetaPatch

	closed chan struct{}
}

func createAgonesSDKServer(t *testing.T, md *pb.MetaPatch) *agonesSDKServer {
	srv := &agonesSDKServer{
		t:      t,
		md:     md,
		closed: make(chan struct{}, 1),
	}

	// sdk must be created on an insecure grpc server
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	// Agones SDK uses environment variable AGONES_SDK_GRPC_PORT to connect
	t.Setenv("AGONES_SDK_GRPC_PORT", port)

	cfg := viper.New()
	cfg.Set(apptest.ServiceName+".hostname", "localhost")
	cfg.Set(apptest.ServiceName+".port", port)

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		func(v config.View, g *appmain.GRPCBindings) error {
			g.AddHandler(func(s *grpc.Server) {
				agonessdk.RegisterSDKServer(s, srv)
			})
			return nil
		},
	)

	return srv
}

func (s *agonesSDKServer) Shutdown(context.Context, *agonessdk.Empty) (*agonessdk.Empty, error) {
	close(s.closed)
	return &agonessdk.Empty{}, nil
}

func (s *agonesSDKServer) WatchGameServer(_ *agonessdk.Empty, srv agonessdk.SDK_WatchGameServerServer) error {
	err := srv.Send(&agonessdk.GameServer{
		ObjectMeta: &agonessdk.GameServer_ObjectMeta{
			Annotations: s.md.Annotations,
			Labels:      s.md.Labels,
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
	})
	if stat, ok := status.FromError(err); ok {
		switch stat.Code() {
		case codes.OK:
			// noop
		case codes.Canceled, codes.DeadlineExceeded:
			// client closed
			return nil
		default:
			s.t.Errorf("failed to send in WatchGameServer: %s", stat.Err())
			return err
		}
	} else {
		s.t.Errorf("failed to send in WatchGameServer: %s", stat.Err())
		return err
	}

	select {
	case <-s.closed:
		return nil
	case <-srv.Context().Done():
		return srv.Context().Err()
	}
}
