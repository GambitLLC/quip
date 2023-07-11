import { View, StyleSheet, ColorValue } from "react-native";
import { border } from "../styles/Border";
import AchievementBadge from "./AchievementBadge";
import { m, p } from "../styles/Spacing";
import { Text } from "../text/Text"
import LinearProgress from "../progress/LinearProgress";
import { typography } from "../styles/Typography";
import theme from "../../theme";

interface AchievementProps {
  name: string,
  color: ColorValue,
  description: string,
  level: number,
  progress: number,
  maxProgress: number,
}

export function Achievement(props: AchievementProps) {
  return (
    <View style={[border.quip, styles.achievement, p('a', 4), m('b', 4)]}>
      <AchievementBadge color={props.color} icon={"trophy"} level={props.level}/>
      <View style={[m('l', 4), styles.textContainer]}>
        <Text style={[typography.p2]}>{props.name}</Text>
        <Text style={[typography.p3, {color: theme.colors.s4}, p('b', 3)]}>{props.description}</Text>
        <LinearProgress percentage={(props.progress/props.maxProgress) * 100}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  achievement: {
    borderRadius: 24,
    width: "100%",
    height: 100,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  }
});

export default Achievement;
