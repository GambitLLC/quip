import {useFrame} from "@react-three/fiber/native";
import React, {createContext, useContext, useEffect, useMemo, useRef, useState, useTransition} from 'react'
import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export const WorldContext = createContext<CANNON.World | null>(null)

interface PhysicsProviderProps {
  timeStep?: number
  maxSubSteps?: number
  children: React.ReactNode
}

export const PhysicsProvider = (props: PhysicsProviderProps) => {
  const world = useMemo(() => new CANNON.World(), [])

  useEffect(() => {
    world.allowSleep = true
    world.broadphase = new CANNON.SAPBroadphase(world)
    if (world.solver instanceof CANNON.GSSolver) {
      world.solver.iterations = 10
      world.solver.tolerance = 1e-7
    }
    world.gravity.set(0, -9.82, 0)
  }, [ world ])

  useFrame((state, delta, xrFrame) => {
    world.fixedStep()
  }, -1)

  return (
    <WorldContext.Provider value={world}>
      {props.children}
    </WorldContext.Provider>
  )
}

export const useCannon = ({ ...props }, fn: (body: CANNON.Body) => void, deps = []) => {
  const ref = useRef<THREE.Object3D>()
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
      ref.current.position.set(body.position.x, body.position.y, body.position.z)
      ref.current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    }
  }, -2)

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

export const PhysicsSphere = (position: Vec3, radius: number) =>
  useCannon({mass: 1}, body => {
    body.addShape(new CANNON.Sphere(radius))
    body.position.set(...position)
  })

export const PhysicsCylinder = (position: Vec3, radius: number, height: number) =>
  useCannon({mass: 1}, body => {
    body.addShape(new CANNON.Cylinder(radius, radius, height, 20))
    body.position.set(...position)
  })

export const PhysicsCone = (position: Vec3, radius: number, height: number) =>
  useCannon({mass: 1}, body => {
    body.addShape(new CANNON.Cylinder(0, radius, height, 20))
    body.position.set(...position)
  })
