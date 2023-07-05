import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { spacing, Text, Screen, InfoImage, typography, m } from "@quip/native-ui";
import { Button } from "react-native-paper";
import { View, StyleSheet } from "react-native";

export default function Info({navigation}: NativeStackScreenProps<ParamListBase, "gameInfo">) {
  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <InfoImage imgSrc={require('../../../assets/game1.jpg')}/>
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
      <View style={[m('x', 6)]}>
        <Button labelStyle={typography.button1} contentStyle={styles.playButton} mode="contained">
          Play Now
        </Button>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  playButton: {
    height: 56,
    borderRadius: 24,
  }
})
