package e2e_test

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
	"github.com/GambitLLC/quip/libs/test"
)

func TestMatchmaking(t *testing.T) {
	tests := map[string][]testAction{
		"get player": {
			sendRequest(&pb.Request{
				Action: &pb.Request_GetPlayer{},
			}),
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_Player{}, r.GetMessage())
				require.Equal(t, id, r.GetPlayer().GetId())
			}),
		},
		"start queue should fail with unknown gamemode": {
			sendRequest(&pb.Request{
				Action: &pb.Request_StartQueue{
					StartQueue: &pb.StartQueue{
						Config: &pb.QueueConfiguration{
							Gamemode: "unknown gamemode",
						},
					},
				}},
			),
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_Error{}, r.GetMessage())
			}),
		},
		"stop queue": {
			sendRequest(&pb.Request{
				Action: &pb.Request_StartQueue{
					StartQueue: &pb.StartQueue{
						Config: &pb.QueueConfiguration{
							Gamemode: "test_2x1",
						},
					},
				}},
			),
			// wait for status searching
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_StatusUpdate{}, r.GetMessage())
				require.IsType(t, &pb.StatusUpdate_QueueStarted{}, r.GetStatusUpdate().GetUpdate())
			}),
			sendRequest(&pb.Request{
				Action: &pb.Request_StopQueue{}},
			),
			// wait for status queue stopped
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_StatusUpdate{}, r.GetMessage())
				require.IsType(t, &pb.StatusUpdate_QueueStopped{}, r.GetStatusUpdate().GetUpdate())
			}),
		},
		"expected flow": {
			// Send start queue request
			sendRequest(&pb.Request{
				Action: &pb.Request_StartQueue{
					StartQueue: &pb.StartQueue{
						Config: &pb.QueueConfiguration{
							Gamemode: "test_1x1",
						},
					},
				}},
			),
			// wait for status searching
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_StatusUpdate{}, r.GetMessage())
				require.IsType(t, &pb.StatusUpdate_QueueStarted{}, r.GetStatusUpdate().GetUpdate())
			}),
			// wait for match found
			expectResponseWithMemo(func(r *pb.Response, id string, memo map[string]any) {
				require.IsType(t, &pb.Response_StatusUpdate{}, r.GetMessage())
				require.IsType(t, &pb.StatusUpdate_MatchFound{}, r.GetStatusUpdate().GetUpdate())
				memo["match_id"] = r.GetStatusUpdate().GetMatchFound().GetMatchId()
			}),
			// End Gameserver
			func(t *testing.T, ctx context.Context, id string, client pb.QuipFrontend_ConnectClient, resps <-chan *pb.Response, agones *test.AgonesAllocationService, memo map[string]any) {
				matchId, ok := memo["match_id"].(string)
				require.True(t, ok, "expected match_id in memo")

				gs := agones.GetGameserver(matchId)
				require.NotNil(t, gs, "got nil gameserver")
				require.NoError(t, gs.Finish(nil), "gs.Finish failed")
			},
			// wait for match finished
			expectResponse(func(r *pb.Response, id string) {
				require.IsType(t, &pb.Response_StatusUpdate{}, r.GetMessage())
				require.IsType(t, &pb.StatusUpdate_MatchFinished{}, r.GetStatusUpdate().GetUpdate())
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
			client, err := fc.Connect(ctx)
			require.NoError(t, err, "client.Connect failed")

			t.Cleanup(func() {
				// wait for client to close before ending test
				require.NoError(t, client.CloseSend(), "client.CloseSend failed")
				select {
				case <-ctx.Done():
					require.Fail(t, "test timed out waiting for client to close")
				case <-client.Context().Done():
					// no op: stream closed
				}
			})

			resps := recvStream(t, ctx, client)
			memo := map[string]any{}

			for _, action := range actions {
				action(t, ctx, id, client, resps, agones, memo)
			}
		})
	}
}
