package matchfunction

import (
	"fmt"
	"log"

	"github.com/pkg/errors"
	"github.com/rs/xid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"open-match.dev/open-match/pkg/matchfunction"
	"open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/config"
)

type Service struct {
	query *omQueryClient
}

func New(cfg config.View) *Service {
	return &Service{
		query: newOmQueryClient(cfg),
	}
}

func (s *Service) Run(req *pb.RunRequest, stream pb.MatchFunction_RunServer) error {
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
		if err := stream.Send(&pb.RunResponse{Proposal: proposal}); err != nil {
			return status.Errorf(codes.Unknown, "stream proposals to Open Match failed: %s", err)
		}
	}

	return nil
}

const (
	TicketsPerMatch int = 2
)

func makeMatches(p *pb.MatchProfile, poolTickets map[string][]*pb.Ticket) ([]*pb.Match, error) {
	// TODO: determine how to deal with pools
	tickets, ok := poolTickets["all"]
	if !ok {
		return nil, errors.Errorf("missing required pool named 'all'")
	}

	// TODO: get TicketsPerMatch from either the match profile or config -- TBD
	matches := []*pb.Match{}
	for {
		if len(tickets) < TicketsPerMatch {
			break
		}

		matchTickets := tickets[:TicketsPerMatch]
		tickets = tickets[TicketsPerMatch:]

		matches = append(matches, &pb.Match{
			MatchId:       fmt.Sprintf("profile-%v-%s", p.GetName(), xid.New().String()),
			MatchProfile:  p.GetName(),
			MatchFunction: "basic-matchfunction",
			Tickets:       matchTickets,
		})
	}

	return matches, nil
}
