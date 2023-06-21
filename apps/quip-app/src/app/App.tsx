/* eslint-disable jsx-a11y/accessible-emoji */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Mesh} from "three";
import {animated, useSpring} from "@react-spring/three";
import {MeshDistortMaterial} from "@react-three/drei";

type Vec3 = [number, number, number]
type Vec2 = [number, number]

const AnimatedMeshDistortMaterial = animated(MeshDistortMaterial)

const MyScene = () => {
  const isOver = useRef(false)

  const { width, height } = useThree(state => state.size)

  const [springs, api] = useSpring(
    () => ({
      scale: 1,
      position: [0, 0],
      color: '#ff6d6d',
      config: key => {
        switch (key) {
          case 'scale':
            return {
              mass: 4,
              friction: 10,
            }
          case 'position':
            return { mass: 4, friction: 220 }
          default:
            return {}
        }
      },
    }),
    []
  )

  const handleClick = useCallback(() => {
    let clicked = false

    return () => {
      clicked = !clicked
      clicked ? handlePointerEnter() : handlePointerLeave()

      api.start({color: clicked ? '#569AFF' : '#ff6d6d',})
    }
  }, [])

  const handlePointerEnter = () => {
    api.start({
      scale: 1.2,
    })
  }

  const handlePointerLeave = () => {
    api.start({
      scale: 1,
    })
  }

  return (
    <animated.mesh
      onClick={handleClick()}
      scale={springs.scale}
      position={springs.position.to((x, y) => [x, y, 0])}>
      <sphereGeometry args={[.8, 64, 32]} />
      <AnimatedMeshDistortMaterial
        speed={2}
        distort={0.7}
        color={springs.color}
      />
    </animated.mesh>
  )
}

export const App = () => {
  return (
    <View style={styles.view}>
      <Canvas>
        <ambientLight intensity={0.8} />
        <pointLight intensity={1} position={[0, 6, 0]} />
        <MyScene/>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default App;
