package matchfunction

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/rs/zerolog"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/anypb"
	"open-match.dev/open-match/pkg/matchfunction"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/protoext"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.matchfunction").
	Logger()

type Service struct {
	query *omQueryClient
}

func New(cfg config.View) *Service {
	return &Service{
		query: newOmQueryClient(cfg),
	}
}

func BindService(cfg config.View, b *appmain.GRPCBindings) error {
	service := New(cfg)
	b.AddHandler(func(s *grpc.Server) {
		ompb.RegisterMatchFunctionServer(s, service)
	})

	return nil
}

func (s *Service) Run(req *ompb.RunRequest, stream ompb.MatchFunction_RunServer) error {
	logger.Debug().Str("profile", req.GetProfile().GetName()).Msg("Generating proposals")

	client, err := s.query.GetClient()
	if err != nil {
		return status.Errorf(codes.Internal, "get query client failed: %s", err.Error())
	}

	poolTickets, err := matchfunction.QueryPools(stream.Context(), client, req.GetProfile().GetPools())
	if err != nil {
		return status.Errorf(codes.Internal, "query tickets failed: %s", err.Error())
	}

	// Generate proposals.
	proposals, err := makeMatches(req.GetProfile(), poolTickets)
	if err != nil {
		return status.Errorf(codes.Internal, "make matches failed: %s", err.Error())
	}

	logger.Debug().Str("profile", req.GetProfile().GetName()).Msgf("Streaming %d proposals", len(proposals))
	for _, proposal := range proposals {
		if err := stream.Send(&ompb.RunResponse{Proposal: proposal}); err != nil {
			return status.Errorf(codes.Unknown, "stream proposals to Open Match failed: %s", err)
		}
	}

	return nil
}

func makeMatches(p *ompb.MatchProfile, poolTickets map[string][]*ompb.Ticket) ([]*ompb.Match, error) {
	profileDetails, err := protoext.OpenMatchProfileDetails(p)
	if err != nil {
		return nil, err
	}

	// TODO: tickets are currently assumed to be 1 per player, deal with multi-player tickets
	ticketsPerMatch := int(profileDetails.Teams * profileDetails.Players)
	if ticketsPerMatch <= 0 {
		return nil, errors.Errorf("invalid game details for profile '%s': got 0 tickets per match", p.Name)
	}

	// TODO: determine how to deal with pools
	tickets, ok := poolTickets["all"]
	if !ok {
		return nil, errors.Errorf("missing required pool named 'all'")
	}

	cfg := &pb.MatchConfiguration{
		Gamemode: profileDetails.Gamemode,
	}

	matches := []*ompb.Match{}
	for {
		if len(tickets) < ticketsPerMatch {
			break
		}

		matchTickets := tickets[:ticketsPerMatch]
		tickets = tickets[ticketsPerMatch:]

		matchRoster, err := CreateMatchRoster(matchTickets)
		if err != nil {
			return nil, err
		}

		match := &ompb.Match{
			MatchId:       fmt.Sprintf("profile-%v-%s", p.GetName(), xid.New().String()),
			MatchProfile:  p.GetName(),
			MatchFunction: "basic-matchfunction",
			Tickets:       matchTickets,
			Extensions:    make(map[string]*anypb.Any),
		}

		err = protoext.SetExtensionDetails(match, &pb.MatchDetails{
			MatchId: match.MatchId,
			Roster:  matchRoster,
			Config:  cfg,
		})
		if err != nil {
			return nil, err
		}

		matches = append(matches, match)
	}

	return matches, nil
}

func CreateMatchRoster(tickets []*ompb.Ticket) (*pb.MatchRoster, error) {
	// teams := make([]*pb.MatchDetails_Team, len(tickets))
	players := make([]string, len(tickets))
	for _, ticket := range tickets {
		details, err := protoext.OpenMatchTicketDetails(ticket)
		if err != nil {
			return nil, errors.WithMessagef(err, "failed to read details on ticket '%s", ticket.Id)
		}

		players = append(players, details.PlayerId)
	}

	return &pb.MatchRoster{
		Players: players,
	}, nil
}
