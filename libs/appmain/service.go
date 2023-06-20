package appmain

// Service is used internally and only exposed for testing purposes.
type Service struct {
	closers []func() error
}

func (s *Service) Stop() error {
	// Close in reverse order for dependencies
	var firstErr error
	for i := len(s.closers) - 1; i >= 0; i-- {
		err := s.closers[i]()
		if firstErr == nil {
			firstErr = err
		}
	}
	return firstErr
}
