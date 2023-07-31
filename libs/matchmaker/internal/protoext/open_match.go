package protoext

import (
	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

const extensionDetailsKey string = "details"

// SetOpenMatchTicketDetails puts details into the extensions on an Open Match ticket.
func SetOpenMatchTicketDetails(dst *ompb.Ticket, details *ipb.TicketDetails) error {
	any, err := anypb.New(details)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		ext = make(map[string]*anypb.Any)
	}
	ext[extensionDetailsKey] = any

	dst.Extensions = ext
	return nil
}

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

// SetOpenMatchProfileDetails puts details into the extensions on an Open Match MatchProfile.
func SetOpenMatchProfileDetails(dst *ompb.MatchProfile, details *ipb.ProfileDetails) error {
	any, err := anypb.New(details)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		ext = make(map[string]*anypb.Any)
	}
	ext[extensionDetailsKey] = any

	dst.Extensions = ext
	return nil
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

func SetOpenMatchMatchDetails(dst *ompb.Match, details *ipb.MatchDetails) error {
	any, err := anypb.New(details)
	if err != nil {
		return err
	}

	ext := dst.GetExtensions()
	if ext == nil {
		ext = make(map[string]*anypb.Any)
	}
	ext[extensionDetailsKey] = any

	dst.Extensions = ext
	return nil
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
