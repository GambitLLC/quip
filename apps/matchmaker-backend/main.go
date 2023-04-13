package main

import (
	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/matchmaker/backend"
)

func main() {
	appmain.RunGRPCService("matchmaker.backend", backend.BindService)
}
