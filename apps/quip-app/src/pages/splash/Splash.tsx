import {
  Arrow,
  Button,
  Circle,
  Diamond1,
  Diamond2,
  LogoIcon,
  LogoText,
  m,
  p,
  Screen,
  spacing,
  Squiggle,
  Star
} from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import React, {useState} from "react";

export default function Splash({navigation}: NativeStackScreenProps<any, "splash">) {
  const [spawned, setSpawned] = useState(1)
  const handleClick = () => {
    console.log(spawned)
    setSpawned(s => s+1)
  }

  return (
    <Screen hasSafeArea={false} screenStyle={{backgroundColor: "#ECEBFF"}} style={[spacing.fill]}>
      <View style={styles.candyContainer}>
        <Squiggle style={[styles.candy, styles.squiggle]}/>
        <Circle style={[styles.candy, styles.circle1]}/>
        <Circle style={[styles.candy, styles.circle2]}/>
        <Star style={[styles.candy, styles.star]}/>
        <Diamond1 style={[styles.candy, styles.diamond1]}/>
        <Diamond2 style={[styles.candy, styles.diamond2]}/>
        <Arrow style={[styles.candy, styles.arrow]}/>
      </View>
      <View style={[styles.container, p('a', 6)]}>
        <View style={styles.spacer}/>
        <View style={styles.logo}>
          <LogoIcon/>
          <LogoText/>
        </View>
        <View style={styles.buttonContainer}>
          <View style={m('b', 2)}>
            <Button style={[styles.loginButton]} mode="contained" title="Log In"/>
          </View>
          <View>
            <Button style={[styles.registerButton]} mode="text" title="Get Started"/>
          </View>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    alignItems: "center"
  },
  candyContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    width: "100%",
  },
  logo: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: 190,
    width: 212,
    marginBottom: 242
  },
  loginButton: {
    width: "100%",
    height: 56,
  },
  registerButton: {
    width: "100%",
    height: 48,
  },
  spacer: {
    flexGrow: 1,
  },
  candy: {
    position: "absolute"
  },
  star: {
    top: 70,
    left: 84
  },
  diamond1: {
    top: 120,
    left: 279,
  },
  diamond2: {
    top: 502,
    left: 28,
  },
  arrow: {
    top: 605,
    left: 260
  },
  squiggle: {
    top: 265,
    left: -125
  },
  circle1: {
    backgroundColor: "#E1DFFF",
    left: -172,
    top: -133,
    width: 360,
    height: 360,
  },
  circle2: {
    backgroundColor: "#E1DFFF",
    right: -121,
    bottom: -51,
    width: 360,
    height: 360,
  }
})
