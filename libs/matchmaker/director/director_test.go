package director

import (
	"context"
	"net"
	"testing"
	"time"

	agonesPb "agones.dev/agones/pkg/allocation/go"
	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestDirectorAllocates(t *testing.T) {
	cfg := viper.New()
	mockAgones := newAgones(t, cfg)
	newService(t, cfg)

	select {
	case <-mockAgones.allocated:
	case <-time.After(10 * time.Second):
		t.Fatal("test timed out without receiving allocation")
	}

	<-time.After(1 * time.Second)
}

type mockAgones struct {
	agonesPb.UnimplementedAllocationServiceServer
	allocated chan struct{}
}

func (a *mockAgones) Allocate(context.Context, *agonesPb.AllocationRequest) (*agonesPb.AllocationResponse, error) {
	select {
	case a.allocated <- struct{}{}:
	default:
	}

	return &agonesPb.AllocationResponse{}, nil
}

func newAgones(t *testing.T, cfg config.Mutable) *mockAgones {
	service := &mockAgones{
		allocated: make(chan struct{}, 1),
	}

	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
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
		func(v config.View, g *appmain.GRPCBindings) error {
			g.AddHandler(func(s *grpc.Server) {
				agonesPb.RegisterAllocationServiceServer(s, service)
			})
			return nil
		},
	)

	return service
}

func newService(t *testing.T, cfg config.Mutable) {
	test.NewRedis(t, cfg)
	test.NewGamesFile(t, cfg)
	newOMBackend(t, cfg)

	apptest.TestDaemon(t, cfg, func(v config.View) appmain.Daemon {
		svc := New(cfg)
		return svc
	})
}

func newOMBackend(t *testing.T, cfg config.Mutable) {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"openmatch.backend",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		BindOpenMatchBackend,
	)
}

func BindOpenMatchBackend(cfg config.View, b *appmain.GRPCBindings) error {
	svc := &stubOMBackendService{}

	b.AddHandler(func(s *grpc.Server) {
		ompb.RegisterBackendServiceServer(s, svc)
	})

	return nil
}

type stubOMBackendService struct {
	ompb.UnimplementedBackendServiceServer
}

// FetchMatches returns a single match with two random tickets
func (s *stubOMBackendService) FetchMatches(req *ompb.FetchMatchesRequest, srv ompb.BackendService_FetchMatchesServer) error {
	tickets := make([]*ompb.Ticket, 2)

	for i := range tickets {
		ticket := &ompb.Ticket{
			Id:         xid.New().String(),
			Extensions: make(map[string]*anypb.Any),
		}

		details := &pb.TicketDetails{
			PlayerId: xid.New().String(),
			Config: &pb.QueueConfiguration{
				Gamemode: "test",
			},
		}

		if err := protoext.SetExtensionDetails(ticket, details); err != nil {
			return err
		}

		tickets[i] = ticket
	}

	roster, err := matchfunction.CreateMatchRoster(tickets)
	if err != nil {
		return err
	}

	match := &ompb.Match{
		MatchId:       xid.New().String(),
		MatchProfile:  req.Profile.Name,
		MatchFunction: "static match generator",
		Tickets:       tickets,
		Extensions:    make(map[string]*anypb.Any),
	}
	err = protoext.SetExtensionDetails(match, &pb.MatchDetails{
		MatchId: match.MatchId,
		Roster:  roster,
		Config: &pb.MatchConfiguration{
			Gamemode: "test",
		},
	})
	if err != nil {
		return err
	}

	srv.Send(&ompb.FetchMatchesResponse{
		Match: match,
	})
	return nil
}

func (s *stubOMBackendService) AssignTickets(context.Context, *ompb.AssignTicketsRequest) (*ompb.AssignTicketsResponse, error) {
	return &ompb.AssignTicketsResponse{}, nil
}
