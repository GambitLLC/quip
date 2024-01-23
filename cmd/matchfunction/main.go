package main

import (
	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/matchmaker/matchfunction"
)

func main() {
	appmain.RunGRPCService("matchmaker.matchfunction", matchfunction.BindService)
}
