import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  AvatarXp,
  Balance,
  LogoText,
  m,
  p,
  Screen,
  Slider,
  spacing,
  theme,
  typography,
  Text
} from "@quip/native-ui";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { ParamListBase } from "@react-navigation/native";

export default function Home({navigation}: NativeStackScreenProps<ParamListBase, "games">) {
  return (
    <>
      <Screen hasSafeArea={false} screenStyle={[{backgroundColor: theme.colors.background}]} style={[spacing.fill]}>
        <View style={[styles.homeContainer]}>
          {/*Topbar*/}
          <View style={[p('x', 6), m('b', 8)]}>
            {/*Player Topbar*/}
            <View style={[styles.playerBar, m('b', 4)]}>
              <Balance amount={2.18}/>
              <AvatarXp level={5} percentage={.05} source={require('../../../assets/AvatarTest.png')}/>
            </View>
            {/*Select Quip*/}
            <Text style={[typography.h5, {color: theme.colors.s1}]}>
              Select Quip
            </Text>
          </View>
          {/*Slider*/}
          <View style={[m('b', 9)]}>
            <Slider/>
          </View>
          {/*Quip Info*/}
          <View style={[p('x', 6)]}>
            <View style={[{display: "flex", flexDirection: "row"}]}>
              <LogoText fill={theme.colors.p2} width={66} height={29}/>
              <Text style={[m('l', 1), typography.h5, {color: theme.colors.s1}]}>
                Race
              </Text>
            </View>
            <View style={[m('t', 2)]}>
              <Text style={[typography.t2]}>
                Enjoy fun physics-based games from your favorite creators.
              </Text>
            </View>
          </View>
          {/*Play Now*/}
          <View style={[{flexGrow: 1}]}/>
          <View style={[p('x', 6)]}>
            <Button labelStyle={typography.button1} contentStyle={styles.playButton} mode="contained">
              Play Now
            </Button>
          </View>
          <View style={[{flexGrow: 1}]}/>
          <View/>
        </View>
      </Screen>
    </>
  )
}

const styles = StyleSheet.create({
  homeContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  playerBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slider: {

  },
  info: {

  },
  playButton: {
    height: 56,
    borderRadius: 24,
  }
})
