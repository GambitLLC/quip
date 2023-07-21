import { PhysicsBox, PhysicsPlane, Vec2, Vec3, WorldContext } from "../Game";
import { Box, Plane, Text } from "@react-three/drei/native";
import {Vec3 as CVec3} from "cannon-es";
import { Accelerometer } from 'expo-sensors';

// @ts-ignore
import { Model as PingPongScene } from "../../../assets/models/ping_pong/Ping_pong_table"
import React, { useContext, useEffect } from "react";
import { useFrame } from "@react-three/fiber/native";

interface StackerProps {
  acceleration: Vec3
}

export function Stacker({acceleration}: StackerProps) {
  const world = useContext(WorldContext)

  //game stuff
  const groundPos: Vec3 = [0, -1, 0]
  const groundSize: Vec2 = [2, 2]
  const [ground, groundBody] = PhysicsPlane(groundPos, groundSize)


  const boxSize: Vec3 = [1, 1, 1]
  const pBoxSize: Vec3 = [.5, .5, .5]

  const boxPos: Vec3 = [0, 1, 0]
  const [box, boxBody] = PhysicsBox(boxPos, pBoxSize)


  const boxPos1: Vec3 = [0, 2, 0]
  const [box1, boxBody1] = PhysicsBox(boxPos1, pBoxSize)

  useFrame(() => {
    boxBody.applyForce(new CVec3(...acceleration).scale(5))
    boxBody1.applyForce(new CVec3(...acceleration).scale(5))
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <Plane ref={ground} position={groundPos} args={groundSize} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <meshStandardMaterial color="white" />
      </Plane>
      <Box ref={box} castShadow receiveShadow position={boxPos} args={boxSize}>
        <meshStandardMaterial color="#6d6d6d" />
      </Box>
      <Box ref={box1} castShadow receiveShadow position={boxPos1} args={boxSize}>
        <meshStandardMaterial color="#6d6d6d" />
      </Box>
    </>
  )
}

export default Stacker
