package main

import (
	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/matchmaker/frontend"
)

func main() {
	appmain.RunGRPCService("matchmaker.frontend", frontend.BindService)
}
