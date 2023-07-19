import Game from "../Game";
import { Center, Resize, PerspectiveCamera } from "@react-three/drei/native";

// @ts-ignore
import { Model } from "../../../assets/models/ping_pong/Ping_pong_table"
import React, {Suspense} from "react";

export function PingPong() {
  return (
    <Game>
      <ambientLight intensity={0.5} />
      <Center>
        <Resize scale={3}>
          <Model/>
        </Resize>
      </Center>
    </Game>
  )
}
