package main

import (
	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/matchmaker/matchfunction"
)

func main() {
	appmain.RunGRPCService("matchmaker.matchfunction", matchfunction.BindService)
}
