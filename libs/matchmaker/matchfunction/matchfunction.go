package matchfunction

import (
	"fmt"
	"log"

	"github.com/pkg/errors"
	"github.com/rs/xid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/anypb"
	"open-match.dev/open-match/pkg/matchfunction"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
	"github.com/GambitLLC/quip/libs/pb"
)

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
	log.Printf("Generating proposals for function %v", req.GetProfile().GetName())

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

	log.Printf("Streaming %v proposals to Open Match", len(proposals))
	for _, proposal := range proposals {
		if err := stream.Send(&ompb.RunResponse{Proposal: proposal}); err != nil {
			return status.Errorf(codes.Unknown, "stream proposals to Open Match failed: %s", err)
		}
	}

	return nil
}

func makeMatches(p *ompb.MatchProfile, poolTickets map[string][]*ompb.Ticket) ([]*ompb.Match, error) {
	gameDetails := &ipb.GameDetails{}
	if err := p.Extensions["details"].UnmarshalTo(gameDetails); err != nil {
		return nil, errors.WithMessagef(err, "failed to unmarshal game details from MatchProfile")
	}

	// TODO: tickets are currently assumed to be 1 per player, deal with multi-player tickets
	ticketsPerMatch := int(gameDetails.Teams * gameDetails.Players)
	if ticketsPerMatch <= 0 {
		return nil, errors.Errorf("invalid game details for profile '%s': got 0 tickets per match", p.Name)
	}

	// TODO: determine how to deal with pools
	tickets, ok := poolTickets["all"]
	if !ok {
		return nil, errors.Errorf("missing required pool named 'all'")
	}

	gameCfg := &pb.GameConfiguration{
		Gamemode: gameDetails.Gamemode,
	}
	gameCfgAny, err := anypb.New(gameCfg)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create anypb from game config: %s", err.Error())
	}

	matches := []*ompb.Match{}
	for {
		if len(tickets) < ticketsPerMatch {
			break
		}

		matchTickets := tickets[:ticketsPerMatch]
		tickets = tickets[ticketsPerMatch:]

		matchDetails, err := CreateMatchDetails(matchTickets)
		if err != nil {
			return nil, err
		}

		matchDetailsAny, err := anypb.New(matchDetails)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to create anypb from match details: %s", err.Error())
		}

		matches = append(matches, &ompb.Match{
			MatchId:       fmt.Sprintf("profile-%v-%s", p.GetName(), xid.New().String()),
			MatchProfile:  p.GetName(),
			MatchFunction: "basic-matchfunction",
			Tickets:       matchTickets,
			Extensions: map[string]*anypb.Any{
				"game_config":   gameCfgAny,
				"match_details": matchDetailsAny,
			},
		})
	}

	return matches, nil
}

func CreateMatchDetails(tickets []*ompb.Ticket) (*pb.MatchDetails, error) {
	teams := make([]*pb.MatchDetails_Team, len(tickets))
	for i, ticket := range tickets {
		details := &ipb.TicketInternal{}
		err := ticket.Extensions["details"].UnmarshalTo(details)
		if err != nil {
			return nil, errors.WithMessagef(err, "failed to read details on ticket '%s", ticket.Id)
		}

		teams[i] = &pb.MatchDetails_Team{
			Players: []string{details.PlayerId},
		}
	}

	matchDetails := &pb.MatchDetails{
		Teams: teams,
	}

	return matchDetails, nil
}
