package e2e_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/require"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/test"
	pb "github.com/GambitLLC/quip/libs/pb/matchmaker"
)

func TestMatch(t *testing.T) {
	cfg := start(t)
	ctx, cancel := context.WithTimeout(test.NewContext(t), 30*time.Second)
	t.Cleanup(cancel)

	client, _ := newFrontendClient(t, cfg)
	stream, err := client.Connect(ctx)
	require.NoError(t, err, "client.Connect failed")

	resps := recvStream(t, ctx, stream)

	{
		// send start queue
		err := stream.Send(&pb.Request{
			Action: &pb.Request_StartQueue{
				StartQueue: &pb.StartQueue{
					Config: &pb.QueueConfiguration{
						Gamemode: "test",
					},
				},
			},
		})
		require.NoError(t, err, "StartQueue failed")
	}

	{
		// expect status searching
		select {
		case <-ctx.Done():
			require.FailNow(t, "test timed out waiting for status searching")
		case resp, ok := <-resps:
			if !ok {
				require.FailNow(t, "response stream closed")
			}

			switch msg := resp.Message.(type) {
			default:
				require.FailNow(t, "unhandled type %T", msg)
			case *pb.Response_Error:
				require.FailNow(t, "received error while waiting for status searching: %v", msg)
			case *pb.Response_StatusUpdate:
				require.NotNil(t, msg.StatusUpdate.GetQueueStarted(), "expected queue started")
			}
		}
	}

	{
		// expect match found
		select {
		case <-ctx.Done():
			require.FailNow(t, "test timed out waiting for match found")
		case resp, ok := <-resps:
			if !ok {
				require.FailNow(t, "response stream closed")
			}

			switch msg := resp.Message.(type) {
			default:
				require.FailNow(t, "unhandled type %T", msg)
			case *pb.Response_Error:
				require.FailNow(t, "received error while waiting for match found: %v", msg)
			case *pb.Response_StatusUpdate:
				require.NotNil(t, msg.StatusUpdate.GetMatchFound(), "expected match found")
			}
		}
	}

	{
		// wait for match finished
		select {
		case <-ctx.Done():
			require.FailNow(t, "test timed out waiting for match finished")
		case resp, ok := <-resps:
			if !ok {
				require.FailNow(t, "response stream closed")
			}

			switch msg := resp.Message.(type) {
			default:
				require.FailNow(t, "unhandled type %T", msg)
			case *pb.Response_Error:
				require.FailNow(t, "received error while waiting for match finished: %v", msg)
			case *pb.Response_StatusUpdate:
				require.NotNil(t, msg.StatusUpdate.GetMatchFinished(), "expected match finished")
			}
		}
	}

	{
		// close stream
		err := stream.CloseSend()
		require.NoError(t, err, "stream.CloseSend failed")

		select {
		case <-ctx.Done():
			require.Fail(t, "test timed out waiting for stream to close")
		case <-stream.Context().Done():
			// no op: stream closed
		}
	}
}
