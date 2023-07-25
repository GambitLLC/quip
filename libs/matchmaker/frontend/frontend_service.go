package frontend

import (
	"os"

	"github.com/rs/zerolog"

	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/games"
	"github.com/GambitLLC/quip/libs/matchmaker/internal/statestore"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

var logger = zerolog.New(os.Stderr).With().
	Str("component", "matchmaker.frontend").
	Logger()

type Service struct {
	store statestore.Service
	omfc  *omFrontendClient
	gc    *games.GameDetailCache
}

func NewService(cfg config.View) *Service {
	return &Service{
		store: statestore.New(cfg),
		omfc:  newOmFrontendClient(cfg),
		gc:    games.NewGameDetailCache(),
	}
}

func (s *Service) Stream(stream pb.Frontend_StreamServer) error {
	session, err := s.newSession(stream)
	if err != nil {
		return err
	}

	defer session.cleanup()

	go session.send()

	// recv returns when the client disconnects or closes the send direction of the stream
	// consider Stream finished in both cases
	return session.recv()
}
