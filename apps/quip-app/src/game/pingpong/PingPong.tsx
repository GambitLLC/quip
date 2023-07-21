import Game from "../Game";
import { Center, Resize } from "@react-three/drei/native";

// @ts-ignore
import { Model as PingPongScene } from "../../../assets/models/ping_pong/Ping_pong_table"
import React, {Suspense} from "react";

export function PingPong() {
  return (
    <Game>
      <ambientLight intensity={0.5} />
      <Suspense>
        <Center>
          <Resize scale={3}>
            <PingPongScene/>
          </Resize>
        </Center>
      </Suspense>
    </Game>
  )
}
