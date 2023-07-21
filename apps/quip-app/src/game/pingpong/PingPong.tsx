import Game, {PhysicsBox, PhysicsPlane, Vec2, Vec3} from "../Game";
import {Box, Center, Plane, Resize} from "@react-three/drei/native";

// @ts-ignore
import { Model as PingPongScene } from "../../../assets/models/ping_pong/Ping_pong_table"
import React, {Suspense} from "react";

export function PingPong() {
  const pos: Vec3 = [0, -.5, 0]
  const size: Vec2 = [2, 2]
  const [plane, planeBody] = PhysicsPlane(pos, size)
  return (
    <>
      <ambientLight intensity={0.5} />
      <Plane ref={plane} args={size} castShadow receiveShadow position={pos} rotation={[-Math.PI / 2, 0, 0]} scale={2}>
        <meshStandardMaterial color="white" />
      </Plane>
      <Suspense>
        <Center>
          <Resize scale={3}>
            <PingPongScene/>
          </Resize>
        </Center>
      </Suspense>
    </>
  )
}
