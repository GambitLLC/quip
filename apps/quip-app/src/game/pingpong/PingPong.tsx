import { Canvas } from "@react-three/fiber";
import {Screen, spacing} from "@quip/native-ui";
import { Physics, usePlane, useBox } from '@react-three/cannon'

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
    </mesh>
  )
}

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }))
  return (
    <mesh ref={ref}>
      <boxGeometry />
    </mesh>
  )
}

export function PingPong() {
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <Canvas>
        <Physics>
          <Plane />
          <Cube />
        </Physics>
      </Canvas>
    </Screen>
  )
}
