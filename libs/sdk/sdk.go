package sdk

import (
	"context"
	"fmt"
	"os"
	"sync"
	"time"

	agonessdk "agones.dev/agones/pkg/sdk"
	agones "agones.dev/agones/sdks/go"
	"github.com/pkg/errors"
	"github.com/rs/zerolog"

	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "sdk").
	Logger()

type OnAllocatedFunc func(*agonessdk.GameServer)

type SDK struct {
	agonesSDK         *agones.SDK
	quipManagerClient pb.QuipManagerClient

	lock          sync.Mutex
	onceAllocated OnAllocatedFunc
	details       *pb.MatchDetails
}

func New(cfg config.View, onAllocated OnAllocatedFunc) (*SDK, error) {
	agonesSDK, err := agones.NewSDK()
	if err != nil {
		return nil, errors.WithMessage(err, "failed to make agones.SDK")
	}

	conn, err := rpc.GRPCClientFromService(cfg, "matchmaker.manager")
	if err != nil {
		return nil, errors.WithMessage(err, "failed to make QuipManager grpc client")
	}

	s := &SDK{
		agonesSDK:         agonesSDK,
		quipManagerClient: pb.NewQuipManagerClient(conn),
		onceAllocated:     onAllocated,
	}

	if err := agonesSDK.WatchGameServer(s.onGameServerChange); err != nil {
		return nil, errors.WithMessage(err, "failed to register game server callback")
	}

	return s, nil
}

// Ready marks the gameserver as ready to receive connections.
func (s *SDK) Ready() error {
	return s.agonesSDK.Ready()
}

// Health sends a health ping to the Agones sidecar.
func (s *SDK) Health() error {
	return s.agonesSDK.Health()
}

// OnceAllocated sets f to be called when the game server is allocated.
// Only gets called once.
func (s *SDK) OnceAllocated(f OnAllocatedFunc) {
	s.lock.Lock()
	s.onceAllocated = f
	s.lock.Unlock()
}

// Cancel cancels the match and marks the server as ready to be shutdown.
func (s *SDK) Cancel(ctx context.Context) error {
	_, err := s.quipManagerClient.CancelMatch(ctx, &pb.CancelMatchRequest{
		MatchId: s.details.MatchId,
	})
	if err != nil {
		return err
	}

	return s.agonesSDK.Shutdown()
}

// Finish sends final match results and marks the server as ready to be shutdown.
func (s *SDK) Finish(results any) error {
	// TODO: figure out results format

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := s.quipManagerClient.FinishMatch(ctx, &pb.FinishMatchRequest{
		MatchId: s.details.MatchId,
		Results: &pb.MatchResults{},
	})
	if err != nil {
		return err
	}

	return s.agonesSDK.Shutdown()
}

func (s *SDK) onGameServerChange(gs *agonessdk.GameServer) {
	// TODO: is string comparison the only way to check allocation?
	if gs.Status.State == "Allocated" {
		details, err := AgonesMatchDetails(gs.GetObjectMeta())
		if err != nil {
			logger.Err(err).Msg("parse match details from game server annotations failed")
			return
		}

		s.lock.Lock()
		defer s.lock.Unlock()

		// Send CreateMatch request to QuipManager iff this allocation is for a new match
		if s.details == nil || s.details.MatchId != details.MatchId {
			// Find the address this gameserver is assigned to
			var conn string
			if ports := gs.GetStatus().GetPorts(); len(ports) == 0 {
				logger.Warn().Msg("Gameserver has no ports")
				conn = gs.GetStatus().GetAddress()
			} else {
				// Prefer port named "game" if it exists, else just use the first port listed
				port := ports[0]
				for _, p := range gs.GetStatus().GetPorts() {
					if p.Name == "game" {
						port = p
					}
				}
				conn = fmt.Sprintf("%s:%d", gs.GetStatus().GetAddress(), port.Port)
			}

			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, err = s.quipManagerClient.CreateMatch(ctx, &pb.CreateMatchRequest{
				MatchId:    details.MatchId,
				Connection: conn,
				Config:     details.Config,
				Roster:     details.Roster,
			})
			if err != nil {
				logger.Err(err).Msg("manager.CreateMatch failed")
				return
			}
		}

		s.details = details
		if s.onceAllocated != nil {
			s.onceAllocated(gs)
			s.onceAllocated = nil
		}
		return
	}
}
