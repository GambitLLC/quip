import {Button, LogoIcon, LogoText, p, Screen, spacing} from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native"
import { Text } from "react-native-paper";
import React, {useState} from "react";

export default function Splash({navigation}: NativeStackScreenProps<any, "splash">) {
  const [spawned, setSpawned] = useState(1)
  const handleClick = () => {
    console.log(spawned)
    setSpawned(s => s+1)
  }

  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <View style={[spacing.fill, spacing.center, {flexDirection: "column"}]}>
        <LogoIcon/>
        <LogoText/>
      </View>
    </Screen>
  )
}
