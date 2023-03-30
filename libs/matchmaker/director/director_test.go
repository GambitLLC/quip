package director

import (
	"context"
	"net"
	"testing"
	"time"

	agones "agones.dev/agones/pkg/allocation/go"
	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
)

func TestMatchFound(t *testing.T) {
	srv := newService(t)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	updates, close, err := srv.broker.ConsumeQueueUpdates(ctx)
	require.NoError(t, err, "ConsumeQueueUpdates failed")
	t.Cleanup(func() { _ = close() })

	errs := make(chan error, 1)

	go func() {
		if err := srv.Start(ctx); err != nil {
			errs <- err
		}
	}()

	for {
		select {
		case <-ctx.Done():
			t.Fatal("test finished without receiving match found update")
		case err := <-errs:
			t.Fatalf("service.Start failed: %s", err.Error())
		case update, ok := <-updates:
			if !ok {
				t.Fatal("queue update channel closed")
			}

			// got some match found, test finished
			if update.GetFound() != nil {
				return
			}
		}
	}
}

func newService(t *testing.T) *Service {
	cfg := viper.New()

	_ = statestoreTesting.NewService(t, cfg)
	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

	newOMBackend(t, cfg)
	newAgones(t, cfg)

	srv := New(cfg).(*Service)

	srv.pc = &games.MatchProfileCache{
		Cacher: config.NewViewCacher(cfg, func(cfg config.View) (interface{}, func(), error) {
			return []*ompb.MatchProfile{
				{
					Name: "all",
				},
			}, nil, nil
		}),
	}

	return srv
}

func newOMBackend(t *testing.T, cfg config.Mutable) {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	cfg.Set("openmatch.backend.hostname", "localhost")
	cfg.Set("openmatch.backend.port", port)

	s := grpc.NewServer()
	ompb.RegisterBackendServiceServer(s, &stubOMBackendService{})

	go func() {
		err := s.Serve(ln)
		if err != nil {
			t.Error(err)
		}
	}()

	t.Cleanup(s.Stop)
}

type stubOMBackendService struct {
	ompb.UnimplementedBackendServiceServer
}

// FetchMatches returns a single match with two random tickets
func (s *stubOMBackendService) FetchMatches(req *ompb.FetchMatchesRequest, srv ompb.BackendService_FetchMatchesServer) error {
	tickets := make([]*ompb.Ticket, 2)

	for i := range tickets {
		ticketInternal := &ipb.TicketInternal{
			PlayerId: xid.New().String(),
			Gamemode: "test",
		}

		detailsAny, err := anypb.New(ticketInternal)
		if err != nil {
			return err
		}

		tickets[i] = &ompb.Ticket{
			Id: xid.New().String(),
			Extensions: map[string]*anypb.Any{
				"details": detailsAny,
			},
		}
	}

	srv.Send(&ompb.FetchMatchesResponse{
		Match: &ompb.Match{
			MatchId:       xid.New().String(),
			MatchProfile:  req.Profile.Name,
			MatchFunction: "static match generator",
			Tickets:       tickets,
		},
	})
	return nil
}

func (s *stubOMBackendService) AssignTickets(context.Context, *ompb.AssignTicketsRequest) (*ompb.AssignTicketsResponse, error) {
	return &ompb.AssignTicketsResponse{}, nil
}

func newAgones(t *testing.T, cfg config.Mutable) {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	cfg.Set("agones.hostname", "localhost")
	cfg.Set("agones.port", port)

	s := grpc.NewServer()
	agones.RegisterAllocationServiceServer(s, &stubAgonesService{})

	go func() {
		err := s.Serve(ln)
		if err != nil {
			t.Error(err)
		}
	}()

	t.Cleanup(s.Stop)

}

type stubAgonesService struct {
	agones.UnimplementedAllocationServiceServer
}

func (s *stubAgonesService) Allocate(context.Context, *agones.AllocationRequest) (*agones.AllocationResponse, error) {
	return &agones.AllocationResponse{Address: "127.0.0.1", Ports: []*agones.AllocationResponse_GameServerStatusPort{{Port: 51383}}}, nil
}
