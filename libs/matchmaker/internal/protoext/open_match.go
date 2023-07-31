package protoext

import (
	"github.com/pkg/errors"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

const extensionDetailsKey string = "details"

type extendable interface {
	GetExtensions() map[string]*anypb.Any
}

// SetExtensionDetails puts src into dst.Extensions.
// NOTE: Requires Extensions to NOT be nil on dst.
func SetExtensionDetails(dst extendable, src proto.Message) error {
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
func OpenMatchTicketDetails(src *ompb.Ticket) (*ipb.TicketDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &ipb.TicketDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}

// OpenMatchProfileDetails gets details from extensions on an Open Match MatchProfile.
func OpenMatchProfileDetails(src *ompb.MatchProfile) (*ipb.ProfileDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &ipb.ProfileDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}

func OpenMatchMatchDetails(src *ompb.Match) (*ipb.MatchDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionDetailsKey)
	}

	details := &ipb.MatchDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}
