package protoext

import (
	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

const extensionTicketDetailsKey string = "details"

// SetOpenMatchTicketDetails puts details into the extensions on an Open Match ticket.
func SetOpenMatchTicketDetails(dst *ompb.Ticket, details *ipb.TicketInternal) error {
	any, err := anypb.New(details)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		ext = make(map[string]*anypb.Any)
	}
	ext[extensionTicketDetailsKey] = any

	dst.Extensions = ext
	return nil
}

// OpenMatchTicketDetails gets details from extensions on an Open Match ticket.
func OpenMatchTicketDetails(src *ompb.Ticket) (*ipb.TicketInternal, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionTicketDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionTicketDetailsKey)
	}

	details := &ipb.TicketInternal{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}

const extensionProfileDetailsKey string = "details"

// SetOpenMatchProfileDetails puts details into the extensions on an Open Match MatchProfile.
func SetOpenMatchProfileDetails(dst *ompb.MatchProfile, details *ipb.GameDetails) error {
	any, err := anypb.New(details)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		ext = make(map[string]*anypb.Any)
	}
	ext[extensionProfileDetailsKey] = any

	dst.Extensions = ext
	return nil
}

// OpenMatchProfileDetails gets details from extensions on an Open Match MatchProfile.
func OpenMatchProfileDetails(src *ompb.MatchProfile) (*ipb.GameDetails, error) {
	ext := src.GetExtensions()
	if ext == nil {
		return nil, errors.New(".Extensions is nil")
	}

	any, ok := ext[extensionProfileDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Extensions is missing expected key: '%s'", extensionProfileDetailsKey)
	}

	details := &ipb.GameDetails{}
	if err := any.UnmarshalTo(details); err != nil {
		return nil, err
	}

	return details, nil
}
