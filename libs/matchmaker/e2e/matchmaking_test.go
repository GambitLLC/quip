package e2e_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/test"
)

func TestMatchmaking(t *testing.T) {
	tests := map[string][]testAction{
		"get player": {
			getPlayerRequest(func(p *pb.Player, err error, id string, memo map[string]any) {
				require.Equal(t, id, p.Id, "GetPlayer should have returned logged in player")
			}),
		},
		"start queue should fail with unknown gamemode": {
			startQueueRequest(&pb.StartQueueRequest{
				Config: &pb.QueueConfiguration{
					Gamemode: "invalid gamemode",
				},
			}, func(err error, id string, memo map[string]any) {
				require.Error(t, err, "StartQueue should have failed")
				require.EqualValues(t, codes.InvalidArgument, status.Code(err), "StartQueue error should be InvalidArgument")
			}),
		},
		"stop queue": {
			startQueueRequest(&pb.StartQueueRequest{
				Config: &pb.QueueConfiguration{
					Gamemode: "test_2x1",
				},
			}, func(err error, id string, memo map[string]any) {
				require.NoError(t, err, "StartQueue should not have failed")
			}),
			// wait for queue to start
			expectUpdate(func(p *pb.PlayerUpdate, id string, memo map[string]any) {
				require.EqualValues(t, pb.PlayerState_PLAYER_STATE_SEARCHING, p.GetPlayer().GetState(), "Player.State should be SEARCHING")
				require.NotNil(t, p.GetUpdate().GetQueueStarted(), "Update should be QueueStarted")
			}),
			stopQueueRequest(func(err error, id string, memo map[string]any) {
				require.NoError(t, err, "StopQueue failed")
			}),
			// wait for queue stopped
			expectUpdate(func(p *pb.PlayerUpdate, id string, memo map[string]any) {
				require.EqualValues(t, pb.PlayerState_PLAYER_STATE_ONLINE, p.GetPlayer().GetState(), "Player.State should be ONLINE")
				require.NotNil(t, p.GetUpdate().GetQueueStopped(), "Update should be QueueStopped")
			}),
		},
		"expected flow": {
			// Send start queue request
			startQueueRequest(&pb.StartQueueRequest{
				Config: &pb.QueueConfiguration{
					Gamemode: "test_1x1",
				},
			}, func(err error, id string, memo map[string]any) {
				require.NoError(t, err, "StartQueue failed")
			},
			),
			// wait for queue to start
			expectUpdate(func(p *pb.PlayerUpdate, id string, memo map[string]any) {
				require.EqualValues(t, pb.PlayerState_PLAYER_STATE_SEARCHING, p.GetPlayer().GetState(), "Player.State should be SEARCHING")
				require.NotNil(t, p.GetUpdate().GetQueueStarted(), "Update should be QueueStarted")
			}),
			// wait for match found
			expectUpdate(func(p *pb.PlayerUpdate, id string, memo map[string]any) {
				require.EqualValues(t, pb.PlayerState_PLAYER_STATE_PLAYING, p.GetPlayer().GetState(), "Player.State should be PLAYING")
				require.NotNil(t, p.GetUpdate().GetMatchFound(), "Update should be MatchFound")
				memo["match_id"] = p.GetUpdate().GetMatchFound().GetMatchId()
			}),
			// End Gameserver
			func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontendClient, updates <-chan *pb.PlayerUpdate, agones *test.AgonesAllocationService, memo map[string]any) {
				matchId, ok := memo["match_id"].(string)
				require.True(t, ok, "expected match_id in memo")

				gs := agones.GetGameserver(matchId)
				require.NotNil(t, gs, "got nil gameserver")
				require.NoError(t, gs.Finish(nil), "gs.Finish failed")
			},
			// wait for match finished
			expectUpdate(func(p *pb.PlayerUpdate, id string, memo map[string]any) {
				require.EqualValues(t, pb.PlayerState_PLAYER_STATE_ONLINE, p.GetPlayer().GetState(), "Player.State should be ONLINE")
				require.NotNil(t, p.GetUpdate().GetMatchFinished(), "Update should be MatchFinished")
			}),
		},
	}

	cfg, agones := start(t)
	for name, actions := range tests {
		actions := actions
		t.Run(name, func(t *testing.T) {
			t.Parallel()

			ctx, cancel := context.WithTimeout(test.NewContext(t), TestTimeout)
			t.Cleanup(cancel)

			fc, id := newFrontendClient(t, cfg)
			client, err := fc.Connect(ctx, &emptypb.Empty{})
			require.NoError(t, err, "client.Connect failed")

			t.Cleanup(func() {
				// wait for client to close before ending test
				cancel()
				select {
				case <-ctx.Done():
					if errors.Is(ctx.Err(), context.DeadlineExceeded) {
						require.Fail(t, "test timed out waiting for client to close")
					}
				case <-client.Context().Done():
					// no op: stream closed
				}
			})

			updates := recvStream(t, ctx, client)
			memo := map[string]any{}

			// read the first update that is sent upon connecting
			<-updates

			for _, action := range actions {
				action(t, ctx, id, fc, updates, agones, memo)
			}
		})
	}
}
