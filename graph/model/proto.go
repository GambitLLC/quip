package model

import (
	"fmt"
	"io"
	"strconv"

	"github.com/GambitLLC/quip/libs/pb/matchmaker"
)

type State matchmaker.State

func (e *State) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	val, ok := matchmaker.State_value[str]
	if !ok {
		return fmt.Errorf("%s is not a valid State", str)
	}
	*e = State(val)
	return nil
}

func (e State) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(matchmaker.State_name[int32(e)]))
}

type Status struct {
	*matchmaker.Status
}

type StatusUpdate struct {
	*matchmaker.StatusUpdate
}

type QueueSearching struct {
	*matchmaker.QueueSearching
}

func (QueueSearching) IsStatusDetails() {}

type QueueStopped struct {
	*matchmaker.QueueStopped
}

func (QueueStopped) IsStatusDetails() {}

type MatchFound struct {
	*matchmaker.MatchFound
}

func (MatchFound) IsStatusDetails() {}
