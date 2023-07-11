import { View, StyleSheet, ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Text } from "../text/Text";
import { typography } from "../styles/Typography";
import theme from "../../theme";
import { IconButton } from "react-native-paper";
import { m, p } from "../styles/Spacing";
import * as React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialCommunityIcons"

interface AchievementBadgeProps {
  color: ColorValue,
  icon: string,
  level: number,
}

export function AchievementBadge(props: AchievementBadgeProps) {
  return (
    <View style={styles.badge}>
      <Svg width={52} height={64} viewBox="0 0 52 64" fill="none">
        <Path d="M0 8.3335C0 3.91522 3.58172 0.333496 8 0.333496H43.8621C48.2803 0.333496 51.8621 3.91522 51.8621 8.3335V47.298C51.8621 50.3038 50.1772 53.0559 47.5003 54.4229L29.5692 63.5791C27.2841 64.746 24.578 64.746 22.2928 63.5791L4.36178 54.4229C1.68483 53.0559 0 50.3038 0 47.298V8.3335Z" fill={props.color}/>
      </Svg>
      <View style={styles.container}>
        <Text style={[typography.label2, styles.levelText]}>LVL {props.level}</Text>
        <View style={[m('t', 1)]}>
          <MaterialIcons color={theme.colors.background} name="trophy" size={24}/>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "relative",
    width: 52,
    height: 64,
  },
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  levelText: {
    marginTop: 6,
    color: theme.colors.background,
    opacity: 0.8,
  }
});

export default AchievementBadge;
