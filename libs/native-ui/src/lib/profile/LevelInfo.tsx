import { View, ViewProps } from "react-native";
import { StyleSheet } from "react-native";
import theme from "../../theme";
import { Text } from "../text/Text";
import LinearProgress from "../progress/LinearProgress";
import { m, p } from "../styles/Spacing";
import { typography } from "../styles/Typography";


interface LevelInfoProps {
  level: number,
  currExp: number,
  totalExp: number
}

export function LevelInfo(props: ViewProps & LevelInfoProps) {
  return (
    <View {...props} style={[styles.levelInfo]}>
      <View style={[styles.topInfo, p('t', 3), p('x', 4), m('b', 2)]}>
        <Text style={[typography.p2]}>Level {props.level}</Text>
        <Text style={[typography.p2]}>{props.currExp} / {props.totalExp}</Text>
      </View>
      <View style={[p('x', 4), m('b', 4)]}>
        <LinearProgress percentage={(props.currExp / props.totalExp) * 100}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  levelInfo: {
    height: 69,
    width: "100%",
    backgroundColor: theme.colors.background,
    borderRadius: 16,
  },
  topInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }
})

export default LevelInfo
