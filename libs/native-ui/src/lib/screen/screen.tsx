import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleProp, View, ViewStyle } from "react-native";
import { spacing } from "../styles/spacing";
import theme from "../../theme";

export function Screen({ children, style, screenStyle, hasSafeArea = true}: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  screenStyle?: StyleProp<ViewStyle>,
  hasSafeArea?: boolean
}) {
  return hasSafeArea ?(
    <>
      <View style={[spacing.fill, {position: "relative", backgroundColor: theme.colors.background}]}>
        <StatusBar style="dark"/>
        <SafeAreaView style={[spacing.fill, screenStyle]}>
          <View style={style ?? spacing.fill}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </>
  ) : (
    <>
      <View style={[spacing.fill, {position: "relative", backgroundColor: theme.colors.background}]}>
        <StatusBar style="dark"/>
        <View style={[style ?? spacing.fill, screenStyle]}>
          {children}
        </View>
      </View>
    </>
  )
}

export default Screen;
