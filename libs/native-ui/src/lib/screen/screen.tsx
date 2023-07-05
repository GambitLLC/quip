import { StatusBar } from "expo-status-bar";
import { StyleProp, View, ViewStyle } from "react-native";
import { p, spacing } from "../styles/spacing";
import theme from "../../theme";

export function Screen({ children, style, screenStyle, hasSafeArea=true}: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  screenStyle?: StyleProp<ViewStyle>,
  hasSafeArea?: boolean,
}) {
  return (
    <View style={[spacing.fill, {position: "relative", backgroundColor: theme.colors.background}]}>
      <StatusBar style="dark"/>
      <View style={[style ?? spacing.fill, screenStyle, p('t', 12)]}>
        {children}
      </View>
    </View>
  )
}

export default Screen;
