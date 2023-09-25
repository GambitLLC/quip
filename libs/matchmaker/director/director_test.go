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

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/broker"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestMatchFound(t *testing.T) {
	cfg := viper.New()
	newService(t, cfg)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	b := broker.NewRedisBroker(cfg)
	statusSub := b.SubscribeStatusUpdate(ctx)
	t.Cleanup(func() { _ = statusSub.Close() })

	for {
		select {
		case <-ctx.Done():
			t.Fatal("test timed out without receiving match found update")
		case update, ok := <-statusSub.Channel():
			if !ok {
				t.Fatal("queue update channel closed")
			}

			// got some match found, test finished
			if update.GetUpdate().GetMatchFound() != nil {
				return
			}
		}
	}
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
