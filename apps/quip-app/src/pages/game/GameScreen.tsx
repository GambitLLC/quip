import { View, StyleSheet } from "react-native";
import { Screen, spacing, p } from "@quip/native-ui";
import React from "react";
import {Canvas} from "@react-three/fiber";
import { PhysicsProvider } from "../../game/Game";
import TankGame from "../../game/tanks/TankGame";
import useControls from "r3f-native-orbitcontrols";

export function GameScreen() {
  const [OrbitControls, events] = useControls()

  return (
    <Screen hasSafeArea={false}>
      <View {...events} style={[spacing.fill, styles.gameView]}>
        <View style={[styles.gameUi, p('b', 12), p('t', 20), p('x', 8)]}>
        </View>
        <Canvas shadows={"percentage"}>
          <OrbitControls enablePan={false} />
          <PhysicsProvider>
            <TankGame/>
          </PhysicsProvider>
        </Canvas>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gameView: {
    position: "relative",
  },

  gameUi: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    zIndex: 1,
    justifyContent: "space-between"
  }
})

export default GameScreen;
