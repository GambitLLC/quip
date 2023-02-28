package broker

// Client is an interface to talk to some messaging system.
type Client interface {
	// Closes the connection.
	Close() error
}
