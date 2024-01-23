package sdk

import (
	"google.golang.org/protobuf/encoding/protojson"

	pb "github.com/GambitLLC/quip/pkg/matchmaker/pb"
	"github.com/pkg/errors"
)

const annotationsDetailsKey string = "details"

type hasAnnotations interface {
	GetAnnotations() map[string]string
}

func SetAnnotationDetails(dst hasAnnotations, src *pb.MatchDetails) error {
	bs, err := protojson.Marshal(src)
	if err != nil {
		return err
	}

	annotations := dst.GetAnnotations()
	if annotations == nil {
		return errors.New(".Extensions is nil")
	}

	annotations[annotationsDetailsKey] = string(bs)

	return nil
}

func AgonesMatchDetails(src hasAnnotations) (*pb.MatchDetails, error) {
	annotations := src.GetAnnotations()
	if annotations == nil {
		return nil, errors.New(".Annotations is nil")
	}

	str, ok := annotations[annotationsDetailsKey]
	if !ok {
		return nil, errors.Errorf(".Annotations is missing expected key: '%s'", annotationsDetailsKey)
	}

	details := &pb.MatchDetails{}
	if err := protojson.Unmarshal([]byte(str), details); err != nil {
		return nil, err
	}

	return details, nil
}
