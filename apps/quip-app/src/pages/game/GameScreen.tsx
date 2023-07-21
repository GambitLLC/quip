import { View, StyleSheet } from "react-native";
import { Screen, spacing, Text, p } from "@quip/native-ui";
import useControls from "r3f-native-orbitcontrols";
import {PingPong} from "../../game/pingpong/PingPong";
import React, { useEffect } from "react";
import {Canvas} from "@react-three/fiber";
import {PhysicsProvider} from "../../game/Game";
import { useState } from "react"
import Stacker from "../../game/stacker/Stacker";
import { DeviceMotion } from "expo-sensors";
import { Subscription } from "expo-modules-core";
import { IconButton } from "react-native-paper";

export function GameScreen() {
  const [OrbitControls, events] = useControls()
  const [dpr, setDpr] = useState(1.5)

  //accelerometer stuff
  const [{x, y, z}, setAcceleration] = useState<{x: number, y: number, z: number}>({x: 0, y: 0, z: 0});
  const [{cx, cy, cz}, setCalibrate] = useState<{cx: number, cy: number, cz: number}>({cx: 0, cy: 0, cz: 0});
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  DeviceMotion.setUpdateInterval(16)

  const _subscribe = () => {
    setSubscription(DeviceMotion.addListener((data) => {setAcceleration(data.acceleration ?? {x: 0, y: 0, z: 0})}));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <Screen hasSafeArea={false}>
      <View {...events} style={[spacing.fill, styles.gameView]}>
        <View style={[styles.gameUi, p('b', 12), p('t', 20), p('x', 8)]}>
          <Text>
            X: {(x - cx).toFixed(2)} Y: {(y - cy).toFixed(2)} Z: {(z - cz).toFixed(2)}
          </Text>
          <IconButton onPress={() => {
            setCalibrate({cx: x, cy: y, cz: z})
          }} mode={"contained"} size={48} icon="target"/>
        </View>
        <Canvas shadows={"percentage"} dpr={dpr}>
          <directionalLight position={[0, 10, -10]} castShadow />
          <OrbitControls
            enablePan={false}
            minZoom={1}
            maxZoom={15}
          />
          <PhysicsProvider>
            <Stacker acceleration={[x-cx, y-cy, z-cz]}/>
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
