import {useFrame} from "@react-three/fiber/native";
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'

const WorldContext = createContext<CANNON.World | null>(null)

interface PhysicsProviderProps {
  timeStep?: number
  maxSubSteps?: number
  children: React.ReactNode
}

function useFrameProcessor(frameProcessor: () => void, dependencies: any): () => void {
  return useCallback(() => {
    'worklet';
    frameProcessor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

export const PhysicsProvider = (props: PhysicsProviderProps) => {
  const world = useMemo(() => new CANNON.World(), [])

  useEffect(() => {
    world.broadphase = new CANNON.NaiveBroadphase()
    // world.solver.iterations = 10
    world.gravity.set(0, -9.82, 0)
  }, [ world ])

  const [lastFrameTime, setLastFrameTime] = useState(performance.now())

  useFrame(() => {
      const now = performance.now()
      const delta = now - lastFrameTime
      setLastFrameTime(now)
      world.step(
        props.timeStep ?? 1/60,
        delta / 1000,
        props.maxSubSteps ?? 10
      )
  })

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

  return [ref, body] as const // Return
}

export type Vec3 = [ number, number, number ]
export type Vec2 = [ number, number ]

export const PhysicsPlane = (position: Vec3, size: Vec2) =>
  useCannon({mass: 0}, body => {
    body.addShape(new CANNON.Plane())
    body.position.set(...position)
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  })

export const PhysicsBox = (position: Vec3, size: Vec3) =>
  useCannon({mass: 2}, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(...size)))
    body.position.set(...position)
  })
