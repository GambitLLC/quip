package test

import (
	"context"
	"fmt"
	"io"
	"sync"

	"github.com/pkg/errors"
	"github.com/rs/xid"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/rpc"
)

func BindOpenMatchService(cfg config.View, b *appmain.GRPCBindings) error {
	svc := &openMatchService{
		cfg: cfg,
	}

	b.AddHandler(func(s *grpc.Server) {
		ompb.RegisterBackendServiceServer(s, svc)
		ompb.RegisterFrontendServiceServer(s, svc)
		ompb.RegisterQueryServiceServer(s, svc)
	})

	return nil
}

type openMatchService struct {
	ompb.UnimplementedBackendServiceServer
	ompb.UnimplementedFrontendServiceServer
	ompb.UnimplementedQueryServiceServer

	cfg config.View
	tm  sync.Map
}

func (s *openMatchService) CreateTicket(ctx context.Context, req *ompb.CreateTicketRequest) (*ompb.Ticket, error) {
	// Perform input validation.
	if req.Ticket == nil {
		return nil, status.Errorf(codes.InvalidArgument, ".ticket is required")
	}
	if req.Ticket.Assignment != nil {
		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with an assignment")
	}
	if req.Ticket.CreateTime != nil {
		return nil, status.Errorf(codes.InvalidArgument, "tickets cannot be created with create time set")
	}

	if req.Ticket.Id == "" {
		req.Ticket.Id = xid.New().String()
	}
	req.Ticket.CreateTime = timestamppb.Now()
	s.tm.Store(req.Ticket.Id, req.Ticket)
	return req.Ticket, nil
}

func (s *openMatchService) DeleteTicket(ctx context.Context, req *ompb.DeleteTicketRequest) (*emptypb.Empty, error) {
	_, ok := s.tm.LoadAndDelete(req.TicketId)
	if !ok {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	return &emptypb.Empty{}, nil
}

func (s *openMatchService) GetTicket(ctx context.Context, req *ompb.GetTicketRequest) (*ompb.Ticket, error) {
	item, ok := s.tm.Load(req.TicketId)
	if !ok {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	ticket, ok := item.(*ompb.Ticket)
	if !ok || ticket == nil {
		return nil, status.Errorf(codes.NotFound, "ticket id %s not found", req.TicketId)
	}

	return ticket, nil
}

func (s *openMatchService) FetchMatches(req *ompb.FetchMatchesRequest, srv ompb.BackendService_FetchMatchesServer) error {
	if req.Config == nil {
		return status.Error(codes.InvalidArgument, ".config is required")
	}
	if req.Profile == nil {
		return status.Error(codes.InvalidArgument, ".profile is required")
	}

	address := fmt.Sprintf("%s:%d", req.GetConfig().GetHost(), req.GetConfig().GetPort())
	conn, err := rpc.GRPCClientFromAddress(s.cfg, address)
	if err != nil {
		return errors.Wrap(err, "failed to create grpc connection to matchfunction")
	}
	client := ompb.NewMatchFunctionClient(conn)
	ctx := srv.Context()

	stream, err := client.Run(ctx, &ompb.RunRequest{Profile: req.Profile})
	if err != nil {
		return errors.Wrap(err, "failed to run match function for profile")
	}

	proposals := make(chan *ompb.Match, 1)
	eg := &errgroup.Group{}

	// send proposals to caller
	eg.Go(func() error {
		for p := range proposals {
			err := srv.Send(&ompb.FetchMatchesResponse{
				Match: p,
			})
			if err != nil {
				return err
			}
		}
		return nil
	})

	// recv proposals from matchfunction
	eg.Go(func() error {
		defer close(proposals)
		for {
			resp, err := stream.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				err = errors.Wrapf(err, "%v.Run() error, %v", client, err)
				if ctx.Err() != nil {
					// gRPC likes to suppress the context's error, so stop that.
					return ctx.Err()
				}
				return err
			}
			select {
			case proposals <- resp.GetProposal():
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		return nil
	})

	return eg.Wait()
}
func (s *openMatchService) AssignTickets(ctx context.Context, req *ompb.AssignTicketsRequest) (*ompb.AssignTicketsResponse, error) {
	failed := []*ompb.AssignmentFailure{}
	for _, assignment := range req.GetAssignments() {
		for _, tid := range assignment.TicketIds {
			val, ok := s.tm.Load(tid)
			if !ok {
				failed = append(failed, &ompb.AssignmentFailure{
					TicketId: tid,
					Cause:    ompb.AssignmentFailure_TICKET_NOT_FOUND,
				})
				continue
			}

			val.(*ompb.Ticket).Assignment = assignment.Assignment
		}
	}

	return &ompb.AssignTicketsResponse{
		Failures: failed,
	}, nil
}

func (s *openMatchService) QueryTickets(req *ompb.QueryTicketsRequest, srv ompb.QueryService_QueryTicketsServer) error {
	ts := []*ompb.Ticket{}

	// TODO: actually filter based on pool
	s.tm.Range(func(key, value any) bool {
		ticket := value.(*ompb.Ticket)
		if ticket.GetAssignment() != nil {
			return true
		}

		ts = append(ts, value.(*ompb.Ticket))
		return true
	})

	return srv.Send(&ompb.QueryTicketsResponse{
		Tickets: ts,
	})
}
