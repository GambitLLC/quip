package director

import (
	"context"
	"net"
	"testing"
	"time"

	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestMatchFound(t *testing.T) {
	srv := newService(t)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	updates, close, err := srv.broker.ConsumeStatusUpdate(ctx)
	require.NoError(t, err, "ConsumeStatusUpdate failed")
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
			if update.GetStatus().GetMatched() != nil {
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
	newBackend(t, cfg)

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
		ticket := &ompb.Ticket{
			Id:         xid.New().String(),
			Extensions: make(map[string]*anypb.Any),
		}

		details := &ipb.TicketDetails{
			PlayerId: xid.New().String(),
			Gamemode: "test",
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
	err = protoext.SetExtensionDetails(match, &ipb.MatchDetails{
		MatchId: match.MatchId,
		Roster:  roster,
		Config: &ipb.MatchDetails_GameConfiguration{
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

func newBackend(t *testing.T, cfg config.Mutable) {
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	cfg.Set("matchmaker.backend.hostname", "localhost")
	cfg.Set("matchmaker.backend.port", port)

	s := grpc.NewServer()
	pb.RegisterBackendServer(s, &stubBackendService{})

	go func() {
		err := s.Serve(ln)
		if err != nil {
			t.Error(err)
		}
	}()

	t.Cleanup(s.Stop)
}

type stubBackendService struct {
	pb.UnimplementedBackendServer
}

func (s *stubBackendService) AllocateMatch(ctx context.Context, req *pb.AllocateMatchRequest) (*pb.MatchDetails, error) {
	return &pb.MatchDetails{MatchId: req.MatchId, Connection: "127.0.0.1:27394"}, nil
}
