package protoext

import (
	"github.com/pkg/errors"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
)

const extensionDetailsKey string = "details"

type hasExtensions interface {
	GetExtensions() map[string]*anypb.Any
}

// SetExtensionDetails puts src into dst.Extensions.
// NOTE: Requires Extensions to NOT be nil on dst.
func SetExtensionDetails(dst hasExtensions, src proto.Message) error {
	any, err := anypb.New(src)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		return errors.New(".Extensions is nil")
	}
	ext[extensionDetailsKey] = any

	return nil
}

// details, err := protoext.GetExtensionDetails[*ompb.Ticket, *ipb.TicketDetails](ticket)
// TODO: benchmark if generic is faster? better? maybe not because it's unclear
// get internal message type maps to each OpenMatch message
// func GetExtensionDetails[E extendable, M proto.Message](src E) (details M, err error) {
// 	ext := src.GetExtensions()
// 	if ext == nil {
// 		return details, errors.New(".Extensions is nil")
// 	}

// 	any, ok := ext[extensionDetailsKey]
// 	if !ok {
// 		return details, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
// 	}

// 	err = any.UnmarshalTo(details)
// 	return
// }

// OpenMatchTicketDetails gets details from extensions on an Open Match ticket.
func OpenMatchTicketDetails(src *ompb.Ticket) (*pb.TicketDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &pb.TicketDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}

// OpenMatchProfileDetails gets details from extensions on an Open Match MatchProfile.
func OpenMatchProfileDetails(src *ompb.MatchProfile) (*pb.ProfileDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &pb.ProfileDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}

func OpenMatchMatchDetails(src *ompb.Match) (*pb.MatchDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &pb.MatchDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}
