import { View } from "react-native";
import { Screen, spacing } from "@quip/native-ui";
import useControls from "r3f-native-orbitcontrols";
import {PingPong} from "../../game/pingpong/PingPong";
import React from "react";
import {Canvas} from "@react-three/fiber";
import {PhysicsProvider} from "../../game/Game";

export function GameScreen() {
  const [OrbitControls, events] = useControls()
  return (
    <Screen hasSafeArea={false}>
      <View {...events} style={[spacing.fill]}>
        <Canvas shadows={"percentage"} camera={{position: [0, 3, 5]}}>
          <directionalLight position={[0, 10, -10]} castShadow />
          <OrbitControls />
          <PhysicsProvider>
            <PingPong/>
          </PhysicsProvider>
        </Canvas>
      </View>
    </Screen>
  );
}

export default GameScreen;
