package main

import (
	"github.com/GambitLLC/quip/internal/appmain"
	"github.com/GambitLLC/quip/internal/matchmaker/director"
)

func main() {
	appmain.RunDaemon("matchmaker.director", director.New)
}
