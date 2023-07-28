package protoext

import (
	"github.com/pkg/errors"
	"google.golang.org/protobuf/types/known/anypb"
	ompb "open-match.dev/open-match/pkg/pb"

	"github.com/GambitLLC/quip/libs/matchmaker/internal/ipb"
)

const extensionTicketDetailsKey string = "details"

// AddTicketDetails puts details into the extensions on an Open Match ticket.
func AddTicketDetails(dst *ompb.Ticket, details *ipb.TicketInternal) error {
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

// GetTicketDetails gets details from extensions on an Open Match ticket.
func GetTicketDetails(src *ompb.Ticket) (*ipb.TicketInternal, error) {
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
