package frontend

import (
	"io"
	"log"

	"github.com/grpc-ecosystem/go-grpc-middleware/util/metautils"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type StreamService struct {
}

func (s *StreamService) Stream(stream matchmaker.FrontendStream_StreamServer) error {
	session, err := newSession(stream)
	if err != nil {
		return err
	}

	go session.send()

	// recv returns when the client disconnects or closes the send direction of the stream
	// consider Stream finished in both cases
	return session.recv()
}

type session struct {
	id     string
	stream matchmaker.FrontendStream_StreamServer

	resps chan *matchmaker.StreamResponse
}

func newSession(stream matchmaker.FrontendStream_StreamServer) (*session, error) {
	id := metautils.ExtractIncoming(stream.Context()).Get("Player-Id")
	if id == "" {
		return nil, status.Error(codes.Unauthenticated, "Player-Id is unknown")
	}

	return &session{
		id:     id,
		stream: stream,
		resps:  make(chan *matchmaker.StreamResponse, 1),
	}, nil
}

// recv consumes from the stream and handles all requests until it closes
func (s *session) recv() error {
	for {
		in, err := s.stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}

		switch in.Message.(type) {
		default:
			// TODO: log this invalid message type
			return status.Error(codes.Internal, "unhandled stream request message type")
		case nil:
			return status.Error(codes.Internal, "unhandled stream request message type")
		case *matchmaker.StreamRequest_GetStatus:
			s.resps <- &matchmaker.StreamResponse{
				Message: &matchmaker.StreamResponse_Error{
					Error: "not implemented",
				},
			}
		case *matchmaker.StreamRequest_StartQueue:
			s.resps <- &matchmaker.StreamResponse{
				Message: &matchmaker.StreamResponse_Error{
					Error: "not implemented",
				},
			}
		case *matchmaker.StreamRequest_StopQueue:
			s.resps <- &matchmaker.StreamResponse{
				Message: &matchmaker.StreamResponse_Error{
					Error: "not implemented",
				},
			}
		}
	}
}

// send continually sends stream responses and status updates until the stream closes
func (s *session) send() {
	// TODO: read status update messages from broker

	for {
		select {
		case <-s.stream.Context().Done():
			return
		case resp := <-s.resps:
			if s, ok := status.FromError(s.stream.Send(resp)); ok {
				switch s.Code() {
				case codes.OK:
					// noop
				case codes.Canceled, codes.DeadlineExceeded:
					// client closed
					return
				default:
					// TODO: handle err
					log.Printf("send err: %v", s.Err())
				}
			}
		}
	}
}
