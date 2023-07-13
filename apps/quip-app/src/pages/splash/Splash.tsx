import {
  Arrow,
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
  theme,
  Star, typography
} from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper"
import { CommonActions, ParamListBase } from "@react-navigation/native";

export default function Splash({navigation}: NativeStackScreenProps<ParamListBase, "splash">) {
  return (
    <Screen hasSafeArea={false} screenStyle={{backgroundColor: theme.colors.s5}} style={[spacing.fill]}>
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
            <Button
              onPress={() => {
                navigation.dispatch({
                  ...CommonActions.navigate("auth"),
                })
              }}
              contentStyle={[styles.loginButton]}
              labelStyle={[typography.button1]}
              mode="contained"
            >
              Log In
            </Button>
          </View>
          <View>
            <Button
              onPress={() => {
                navigation.dispatch({
                  ...CommonActions.navigate("auth"),
                })
              }}
              contentStyle={[styles.registerButton]}
              labelStyle={[typography.button1]}
              mode="text"
            >
              Get Started
            </Button>
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
    backgroundColor: theme.colors.splash,
    left: -172,
    top: -133,
    width: 360,
    height: 360,
  },
  circle2: {
    backgroundColor: theme.colors.splash,
    right: -121,
    bottom: -51,
    width: 360,
    height: 360,
  }
})
