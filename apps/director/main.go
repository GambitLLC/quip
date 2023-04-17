package main

import (
	"github.com/GambitLLC/quip/libs/appmain"
	"github.com/GambitLLC/quip/libs/matchmaker/director"
)

func main() {
	appmain.RunDaemon("matchmaker.director", director.New)
}
