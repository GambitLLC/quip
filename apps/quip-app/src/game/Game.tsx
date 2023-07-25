import { ThreeEvent, useFrame } from "@react-three/fiber/native";
import React, { useEffect, useRef, useState, } from "react";
import { useWorld } from "./store/WorldStore";
import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import { Box, Cylinder, Plane, Sphere } from "@react-three/drei/native";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events";

interface PhysicsProviderProps {
  timeStep?: number
  maxSubSteps?: number
  children: React.ReactNode
}

export const PhysicsProvider = (props: PhysicsProviderProps) => {
  const store = useWorld()

  useEffect(() => {
    store.world.allowSleep = true
    store.world.broadphase = new CANNON.SAPBroadphase(store.world)
    if (store.world.solver instanceof CANNON.GSSolver) {
      store.world.solver.iterations = 10
      store.world.solver.tolerance = 1e-7
    }
    store.world.gravity.set(0, -9.82, 0)
  }, [ store.world ])

  useFrame((state, delta, xrFrame) => {
    store.world.fixedStep()
  }, -1)

  return (
    <>
      {props.children}
    </>
  )
}

export const useCannon = (props: PhysicsObjectProps, fn: (body: CANNON.Body) => void, deps = []) => {
  const store = useWorld();
  const ref = useRef<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>>() as
    React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>>

  const toMap = ["position", "rotation", "scale", "velocity", "angularVelocity", "linearFactor", "angularFactor"]
  const mappedProps = Object.fromEntries(Object.entries(props).map(([key, value]) => {
    if (toMap.includes(key)) return [key, new CANNON.Vec3(...value as Vec3)]
    else return [key, value]
  }))

  const [ body ] = useState(() => new CANNON.Body(mappedProps as CANNON.BodyOptions))

  useEffect(() => {
    // Call function so the user can add shapes, positions, etc. to the body
    fn(body)
    store.addBody(body)
    return () => store.removeBody(body)
  }, deps)


  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(body.position.x, body.position.y, body.position.z)
      ref.current.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
    }
  }, -2)

  return [ref, body] as const // Return
}

type Vec3 = [number, number, number]
type Vec2 = [number, number]

interface PhysicsObjectProps extends EventHandlers {
  //object properties
  position?: Vec3;
  rotation?: Vec3;

  //velocities
  velocity?: Vec3;
  angularVelocity?: Vec3;

  //mass
  mass?: number;

  //material
  material?: CANNON.Material;

  //damping
  linearDamping?: number;
  angularDamping?: number;

  //constraints
  fixedRotation?: boolean;

  //factors
  linearFactor?: Vec3;
  angularFactor?: Vec3;

  //collision
  isTrigger?: boolean;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
  collisionResponse?: boolean;

  //events
  events?: EventHandlers
}

interface PhysicsPlaneProps extends PhysicsObjectProps {
  scale?: Vec2
}

export const PhysicsPlane = (props: PhysicsPlaneProps) => {
  const position = props.position ?? [0, 0, 0]
  const rotation = props.rotation ?? [-Math.PI / 2, 0, 0]
  const scale = props.scale ?? [1, 1]

  const [ref, body] = useCannon(props, body => {
    body.addShape(new CANNON.Plane())
    body.position.set(...position)
    body.quaternion.setFromEuler(...rotation)
  })

  return [
    ({children}: {children?: React.ReactNode}) =>
    <Plane args={scale} {...props.events} ref={ref} castShadow receiveShadow>
      {children}
    </Plane>,
    body
  ] as const
}

interface PhysicsBoxProps extends PhysicsObjectProps {
  scale?: Vec3
}

export const PhysicsBox = (props: PhysicsBoxProps) => {
  const position = props.position ?? [0, 0, 0]
  const rotation = props.rotation ?? [0, 0, 0]
  const scale = props.scale ?? [1, 1, 1]


  const [ref, body] = useCannon(props, body => {
    body.addShape(new CANNON.Box(new CANNON.Vec3(...scale)))
    body.position.set(...position)
    body.quaternion.setFromEuler(...rotation)
  })

  return [
    ({children}: {children?: React.ReactNode}) => <Box args={scale.map(v => v*2) as Vec3} {...props.events} ref={ref} castShadow receiveShadow>
      {children}
    </Box>,
    body
  ] as const
}

interface PhysicsSphereProps extends PhysicsObjectProps {
  radius?: number
}

export const PhysicsSphere = (props: PhysicsSphereProps) => {
  const radius = props.radius ?? 1
  const position = props.position ?? [0, 0, 0]
  const rotation = props.rotation ?? [0, 0, 0]

  const [ref, body] = useCannon(props, body => {
    body.addShape(new CANNON.Sphere(radius))
    body.position.set(...position)
    body.quaternion.setFromEuler(...rotation)
  })

  return [
    ({children}: {children?: React.ReactNode}) => <Sphere args={[radius, 32, 32]} {...props.events} ref={ref} castShadow receiveShadow>
      {children}
    </Sphere>,
    body
  ] as const
}

interface PhysicsCylinderProps extends PhysicsSphereProps {
  height?: number
}

export const PhysicsCylinder = (props: PhysicsCylinderProps) => {
  const radius = props.radius ? props.radius : 1
  const height = props.height ? props.height : 1
  const position = props?.position ?? [0, 0, 0]

  const [ref, body] = useCannon(props, body => {
    body.addShape(new CANNON.Cylinder(radius, radius, height*2, 20))
    body.position.set(...position)
  })

  return [
    ({children}: {children?: React.ReactNode}) => <Cylinder args={[radius, radius, height*2, 32]} {...props.events} ref={ref} castShadow receiveShadow>
      {children}
    </Cylinder>,
    body
  ] as const
}

export const PhysicsCone = (props: PhysicsCylinderProps) => {
  const radius = props.radius ? props.radius : 1
  const height = props.height ? props.height : 1
  const position = props?.position ?? [0, 0, 0]

  const [ref, body] = useCannon(props, body => {
    body.addShape(new CANNON.Cylinder(0, radius, height*2, 20))
    body.position.set(...position)
  })

  return [
    ({children}: {children?: React.ReactNode}) => <Cylinder args={[0, radius, height * 2, 32]} {...props.events} ref={ref} castShadow receiveShadow>
      {children}
    </Cylinder>,
    body
  ] as const
}
