package main

import (
	"context"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gorilla/websocket"

	"github.com/GambitLLC/quip/graph"
	"github.com/GambitLLC/quip/libs/auth"
	"github.com/GambitLLC/quip/libs/config"
)

const defaultPort = "8080"

func main() {
	cfg, err := config.Read()
	if err != nil {
		log.Fatalf("failed to read config: %s", err.Error())
	}

	port := cfg.GetString("api.graph.port")
	if port == "" {
		port = defaultPort
	}

	resolver, err := graph.NewResolver(cfg)
	if err != nil {
		log.Fatalf("failed to create resolver: %s", err.Error())
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(&transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		InitFunc: func(ctx context.Context, initPayload transport.InitPayload) (context.Context, error) {
			// Get token and user id from authorization header in payload
			return auth.NewTokenContext(ctx, strings.TrimPrefix(initPayload.Authorization(), "Bearer "))
		},
	})
	srv.Use(extension.Introspection{})

	// TODO: don't serve playground in production
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", auth.TokenContextMiddleware(srv))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
