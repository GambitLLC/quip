import { View, StyleSheet, useWindowDimensions } from "react-native";
import React, { useContext, useEffect, useMemo, useRef } from "react";
import { OrthographicCamera } from "@react-three/drei/native";
import * as THREE from "three";
import { PhysicsBox, PhysicsCone, PhysicsCylinder, PhysicsPlane, PhysicsSphere } from "../Game";
import { useWorld } from "../store/WorldStore";
import useControls from "r3f-native-orbitcontrols";

interface TankGameProps {

}

function degToRad(deg: number) {
  return deg * Math.PI / 180
}

export function TankGame(props: TankGameProps) {
  const store = useWorld()
  const {width, height} = useWindowDimensions()
  const cameraPos = new THREE.Vector3(-height/2, height/2, -height/2)
  const cameraLookAt = new THREE.Vector3(0, 0, 0)

  const camera = useRef<THREE.OrthographicCamera | null>(null)

  const [Plane, planeBody] = PhysicsPlane({
    position: [0, -0, 0],
    rotation: [degToRad(-90), 0, 0],
    scale: [1000, 1000],
  })

  const [Box, boxBody] = PhysicsBox({
    position: [0, 30, 0],
    scale: [5, 5, 5],
    mass: 1,
  })

  const [Cylinder, cylinderBody] = PhysicsCylinder({
    position: [0, 40, 0],
    height: 5,
    radius: 5,
    mass: 1,
  })

  const [Sphere, sphereBody] = PhysicsSphere({
    position: [0, 80, 0],
    radius: 5,
    mass: 1,
  })

  const [Cone, coneBody] = PhysicsCone({
    position: [0, 100, 0],
    radius: 5,
    height: 5,
    mass: 1,
  })

  useEffect(() => {
    if (camera.current) {
      camera.current.lookAt(cameraLookAt)
    }
  }, [camera.current])

  return (
    <>
      {/*<OrthographicCamera ref={camera} zoom={10} makeDefault position={cameraPos} args={[width / -2, width /2, height /2, height /-2, .01, 1000]} />*/}
      <directionalLight position={[0, 10, 0]} intensity={1} castShadow receiveShadow />
      <Plane>
        <meshStandardMaterial color="#d1d1d1" />
      </Plane>
      <Box>
        <meshStandardMaterial color="blue" />
      </Box>
      <Sphere>
        <meshStandardMaterial color="red" />
      </Sphere>
      <Cylinder>
        <meshStandardMaterial color="green" />
      </Cylinder>
      <Cone>
        <meshStandardMaterial color="yellow" />
      </Cone>
      <ambientLight intensity={0.5} />
    </>
  );
}

const styles = StyleSheet.create({});

export default TankGame;
