import { Screen, spacing} from "@quip/native-ui";
import { Canvas, useFrame } from "@react-three/fiber/native";
import React, { createContext, useEffect, useRef, useContext, useState } from 'react'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'

const WorldContext = createContext<CANNON.World | null>(null)

interface PhysicsProviderProps {
  children: React.ReactNode
}

const PhysicsProvider = (props: PhysicsProviderProps) => {
  const [ world ] = useState(() => new CANNON.World())

  useEffect(() => {
    world.broadphase = new CANNON.NaiveBroadphase()
    // world.solver.iterations = 10
    world.gravity.set(0, -9.82, 0)
  }, [ world ])

  // Run world stepper every frame
  useFrame(() => world.fixedStep())

  return (
    <WorldContext.Provider value={world}>
      {props.children}
    </WorldContext.Provider>
  )
}

export const useCannon = ({ ...props }, fn: (body: CANNON.Body) => void, deps = []) => {
  const ref = useRef<THREE.Mesh>()
  const world = useContext(WorldContext)
  const [ body ] = useState(() => new CANNON.Body(props))

  useEffect(() => {
    // Call function so the user can add shapes, positions, etc. to the body
    fn(body)
    world?.addBody(body)
    return () => world?.removeBody(body)
  }, deps)

  useFrame(() => {
    if (ref.current) {
      // Transport cannon physics into the referenced threejs object
      const { position, quaternion } = body
      const { x: px, y: py, z: pz } = position
      const { x: qx, y: qy, z: qz, w: qw } = quaternion
      ref.current.position.copy(new THREE.Vector3(px, py, pz))
      ref.current.quaternion.copy(new THREE.Quaternion(qx, qy, qz, qw))
    }
  })

  return ref
}

interface GameProps {
  children: React.ReactNode,
}

export function Game(props: GameProps) {
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <Canvas>
        {props.children}
      </Canvas>
    </Screen>
  )
}

type Vec3 = [ number, number, number ]

export interface BoxProps {
  position: Vec3
  width: number
  height: number
  length: number
}
export const Box = (props: BoxProps) => {
  const ref = useCannon({ mass: 10 }, body => {
    body.addShape(
      new CANNON.Box(
        new CANNON.Vec3(props.width * 0.5, props.height * 0.5, props.length * 0.5)
      )
    )
    body.position.set(...props.position)
  })
  return (
    <mesh ref={ref}>
      <boxGeometry attach="geometry" args={[ props.width, props.height, props.length ]} />
      <meshStandardMaterial attach="material" />
    </mesh>
  )
}

export interface PlaneProps {
  position: Vec3
  width: number
  length: number
}
export const Plane = (props: PlaneProps) => {
  const ref = useCannon({ mass: 0 }, body => {
    body.addShape(
      new CANNON.Plane()
    )
    body.position.set(...props.position)
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  })

  return (
    <mesh ref={ref}>
      <planeGeometry attach="geometry" args={[ props.width, props.length ]} />
      <meshStandardMaterial attach="material" color="blue" />
    </mesh>
  )
}

export default Game;
