package e2e_test

import (
	"context"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"sync"
	"testing"
	"time"

	agones "agones.dev/agones/pkg/allocation/go"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/magiclabs/magic-admin-go/token"
	"github.com/pkg/errors"
	"github.com/rs/xid"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/appmain/apptest"
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/backend"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
	statestoreTesting "github.com/GambitLLC/quip/libs/matchmaker/internal/statestore/testing"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
	"github.com/GambitLLC/quip/libs/test/data"
)

// start spins up all matchmaker services in memory for the duration of the test.
func start(t *testing.T) config.View {
	cfg := viper.New()
	_ = statestoreTesting.NewService(t, cfg)
	cfg.Set("broker.hostname", cfg.Get("matchmaker.redis.hostname"))
	cfg.Set("broker.port", cfg.Get("matchmaker.redis.port"))

	// set tls
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKeyFile", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))

	// TODO: add cfg logging.level

	// spin up all services
	ln, err := net.Listen("tcp", ":0")
	require.NoError(t, err, "net.Listen failed")

	_, port, err := net.SplitHostPort(ln.Addr().String())
	require.NoError(t, err, "net.SplitHostPort failed")

	services := []string{
		apptest.ServiceName,
		"matchmaker.frontend",
		"matchmaker.backend",
		"matchmaker.matchfunction",
		"agones",
		"openmatch.backend",
		"openmatch.frontend",
		"openmatch.query",
	}
	for _, svc := range services {
		cfg.Set(svc+".hostname", "localhost")
		cfg.Set(svc+".port", port)
	}

	apptest.TestGRPCService(
		t,
		cfg,
		[]net.Listener{ln},
		frontend.BindService,
		backend.BindService,
		matchfunction.BindService,
		bindAgonesService,
		bindOpenMatchService,
	)

	// start up director as well
	apptest.TestDaemon(t, cfg, director.New)

	return cfg
}

type contextTestKey string

func newContext(t *testing.T) context.Context {
	return context.WithValue(context.Background(), contextTestKey("testing.T"), t)
}

// createDidToken returns an arbitrary DID Token and the associated id
func createDidToken(t *testing.T) (string, string) {
	privKey, err := crypto.GenerateKey()
	require.NoError(t, err, "GenerateKey failed")
	addr := crypto.PubkeyToAddress(privKey.PublicKey)

	claimObj := token.Claim{
		Iat: time.Now().Unix(),
		Ext: time.Now().Add(10 * time.Minute).Unix(),
		Iss: fmt.Sprintf("did:ethr:%s", addr.String()),
	}

	jsonClaim, err := json.Marshal(claimObj)
	require.NoError(t, err, "marshal claim failed")

	claimHash := crypto.Keccak256Hash([]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(jsonClaim), jsonClaim)))
	proof, err := crypto.Sign(claimHash.Bytes(), privKey)
	require.NoError(t, err, "sign claim failed")
	// crypto.Sign returns V = 0 or 1, validator excepts 27/28
	if proof[64] == 0 || proof[64] == 1 {
		proof[64] += 27
	}

	marshaledToken, err := json.Marshal([]string{hexutil.Encode(proof), string(jsonClaim)})
	require.NoError(t, err, "marshal token failed")

	didToken := base64.URLEncoding.EncodeToString(marshaledToken)
	return didToken, claimObj.Iss
}

func bindAgonesService(cfg config.View, b *appmain.GRPCBindings) error {
	svc := &agonesService{
		cfg: cfg,
	}

	b.AddHandler(func(s *grpc.Server) {
		agones.RegisterAllocationServiceServer(s, svc)
	})

	return nil
}

func newGRPCClient(cfg config.View, addr string, opts ...grpc.DialOption) (*grpc.ClientConn, error) {
	trustedCertFile := cfg.GetString("api.tls.rootCertificateFile")
	if len(trustedCertFile) > 0 {
		trustedCertData, err := os.ReadFile(trustedCertFile)
		if err != nil {
			return nil, errors.WithMessagef(err, "failed to read client trusted certificate file")
		}

		pool := x509.NewCertPool()
		if !pool.AppendCertsFromPEM(trustedCertData) {
			return nil, errors.New("failed to append client trusted certificate data to pool")
		}

		opts = append(opts, grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(pool, "")))
	} else {
		opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	}

	return grpc.Dial(addr, opts...)
}

type agonesService struct {
	cfg config.View
	agones.UnimplementedAllocationServiceServer
}

func (s *agonesService) Allocate(ctx context.Context, req *agones.AllocationRequest) (*agones.AllocationResponse, error) {
	annotations := req.GetMetadata().GetAnnotations()
	if annotations == nil {
		return nil, errors.New(".Metadata.Annotations is required")
	}

	bs, ok := annotations["match_details"]
	if !ok {
		return nil, errors.New(".Metadata.Annotations[\"match_details\"] is required")
	}

	details := &pb.AllocateMatchRequest{}
	if err := protojson.Unmarshal([]byte(bs), details); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal match_details from annotations")
	}

	if err := createServer(s.cfg, details); err != nil {
		return nil, err
	}

	return &agones.AllocationResponse{
		Address: "localhost",
		Ports: []*agones.AllocationResponse_GameServerStatusPort{
			{
				Name: "",
				Port: 25565,
			},
		},
	}, nil
}

func createServer(cfg config.View, details *pb.AllocateMatchRequest) error {
	conn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.backend")
	if err != nil {
		return errors.Wrap(err, "create grpc client failed")
	}

	go func() {
		<-time.After(3 * time.Second)
		client := pb.NewBackendClient(conn)
		_, err := client.FinishMatch(context.Background(), &pb.FinishMatchRequest{
			MatchId: details.MatchId,
		})
		if err != nil {
			log.Printf("failed to finish match: %v", err)
		}
	}()

	return nil
}

func bindOpenMatchService(cfg config.View, b *appmain.GRPCBindings) error {
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
	conn, err := newGRPCClient(s.cfg, address)
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
