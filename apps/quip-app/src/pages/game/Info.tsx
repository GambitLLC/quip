import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { spacing, Text, Screen, InfoImage, typography, p, m, theme, PlayerCountLabel } from "@quip/native-ui";
import { Button, IconButton } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function Info({navigation}: NativeStackScreenProps<ParamListBase, "gameInfo">) {
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <View style={{width: "100%", height: "100%", display:"flex", flexDirection:"column"}}>
        <View style={{position: "relative"}}>
          <InfoImage imgSrc={require('../../../assets/game1.jpg')}/>
          <View style={[{position: "absolute", width: "100%"}, p('t', 10), p('r', 6), p('l', 2)]}>
            <View style={[styles.imageHeader]}>
              <IconButton onPress={() => navigation.goBack()} size={32} icon={"arrow-left"} iconColor={theme.colors.background}/>
              <PlayerCountLabel numPlayers="25.3k Players"/>
            </View>
          </View>
        </View>
        <View style={[m('t', 6), m('x', 6)]}>
          <Text style={[typography.h6, m('b', 2)]}>
            The Game
          </Text>
          <Text style={[typography.p3, {opacity: .6}]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac leo at sapien sagittis fringilla. Sed consequat magna vel turpis sodales, eget vehicula nulla sollicitudin. Etiam ac tincidunt neque.
          </Text>
        </View>
        <View style={[m('t', 10), m('x', 6)]}>
          <Text style={[typography.h6, m('b', 2)]}>
            Controls
          </Text>
          <Text style={[typography.p3, {opacity: .6}]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>
        </View>
        <View style={{flexGrow: 1}}/>
        <View style={[m('x', 6), m('b', 12)]}>
          <Button labelStyle={typography.button1} contentStyle={styles.playButton} mode="contained">
            Play Now
          </Button>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  playButton: {
    height: 56,
    borderRadius: 24,
  },
  imageHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }
})
