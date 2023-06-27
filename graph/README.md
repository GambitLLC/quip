# graph

GraphQL schema and implementation for the public user API. Meant for public, RESTful operations
such as getting or maniuplating user profile data.

## NOTE/TODO

Currently, schema includes matchmaking operations such as starting queue and getting status.
This is to be fully removed -- matchmaking operations are done through gRPC and gRPC clients
should already be available for that purpose.
