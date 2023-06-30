import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {AvatarXp, Balance, m, p, QuipNav, Screen, Slider, spacing, theme, typography} from "@quip/native-ui";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Home({navigation}: NativeStackScreenProps<any, "home">) {
  return (
    <>
      <Screen screenStyle={{backgroundColor: theme.colors.background}} style={[spacing.fill, p('x', 6), p('t', 8)]}>
        <View style={styles.homeContainer}>
          {/*Topbar*/}
          <View>
            {/*Player Topbar*/}
            <View style={[styles.playerBar, m('b', 4)]}>
              <Balance amount={2.18}/>
              <AvatarXp level={5} percentage={.05} source={require('../../../assets/AvatarTest.png')}/>
            </View>
            {/*Select Quip*/}
            <View style={[m('b', 8)]}>
              <Text style={[typography.h5, {color: theme.colors.s1}]}>
                Select Quip
              </Text>
            </View>
          </View>
          {/*Slider*/}
          <View>
            <Slider/>
          </View>
          {/*Quip Info*/}
          <View style={[m('t', 9)]}>
            <Text style={[m('b', 2)]}>
              <Text style={{color: theme.colors.p2}}>quip</Text> Race
            </Text>
            <Text>
              Enjoy fun physics-based games from your favorite creators.
            </Text>
          </View>
          {/*Play Now*/}
          <View>
            <Button labelStyle={typography.button1} contentStyle={styles.playButton} mode="contained">
              Play Now
            </Button>
          </View>
          {/*Bottom Quip Nav*/}
          <View>
            <QuipNav/>
          </View>
        </View>
      </Screen>
    </>
  )
}

const styles = StyleSheet.create({
  homeContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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
