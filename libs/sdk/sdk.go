package sdk

import (
	"context"
	"sync"

	agonesSDK "agones.dev/agones/pkg/sdk"
	agones "agones.dev/agones/sdks/go"
	"github.com/pkg/errors"

	"github.com/GambitLLC/quip/libs/config"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/rpc"
)

type OnAllocatedFunc func ()

type SDK struct {
	agonesSDK *agones.SDK
	quipManagerClient pb.QuipManagerClient

	lock sync.Mutex
	onAllocated OnAllocatedFunc
}

func New(cfg config.View) (*SDK, error) {
	agonesSDK, err := agones.NewSDK()
	if err != nil {
		return nil, errors.WithMessage(err, "failed to make agones.SDK")
	}

	conn, err := rpc.GRPCClientFromConfig(cfg, "matchmaker.manager")
	if err != nil {
		return nil, errors.WithMessage(err, "failed to make QuipManager grpc client")
	}

	s := &SDK{
		agonesSDK: agonesSDK,
		quipManagerClient: pb.NewQuipManagerClient(conn),
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

// OnAllocated sets f to be called when the game server is allocated.
func (s *SDK) OnAllocated(f OnAllocatedFunc) {
	s.onAllocated = f
}

// Cancel cancels the match and marks the server as ready to be shutdown.
func (s *SDK) Cancel(ctx context.Context) error {
	_, err := s.quipManagerClient.CancelMatch(ctx, &pb.CancelMatchRequest{
		MatchId: "", // TODO: get matchid
	})
	if err != nil {
		return err
	}

	return s.agonesSDK.Shutdown()
}

// Finish sends final match results and marks the server as ready to be shutdown.
func (s *SDK) Finish(results any) error {
	// TODO: handle game results
	return s.agonesSDK.Shutdown()
}

func (s *SDK) onGameServerChange(gs *agonesSDK.GameServer) {
	// TODO: is string comparison the only way to check allocation?
	if gs.Status.State == "Allocated" {
		s.lock.Lock()
		defer s.lock.Unlock()
		// TODO: set internal data for sdk
		s.onAllocated()
		return
	}
}