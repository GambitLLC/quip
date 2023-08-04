import { StatusBar } from "expo-status-bar";
import {ColorValue, StyleProp, View, ViewStyle} from "react-native";
import { p, spacing } from "../styles/Spacing";
import theme from "../../theme";
import React from "react";

export function Screen({ children, style, screenStyle, hasSafeArea=true, backgroundColor=theme.colors.background}: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  screenStyle?: StyleProp<ViewStyle>,
  hasSafeArea?: boolean,
  backgroundColor?: ColorValue
}) {
  return (
    <View style={[spacing.fill, {position: "relative", backgroundColor}]}>
      <StatusBar style="dark"/>
      <View style={[style ?? spacing.fill, screenStyle, hasSafeArea ? p('t', 12) : p('t', 0)]}>
        {children}
      </View>
    </View>
  )
}

export default Screen;
