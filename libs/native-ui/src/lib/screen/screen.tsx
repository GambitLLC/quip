import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { spacing } from "../styles/spacing";

export function Screen({ children, style, screenStyle, hasSafeArea = true, hasBottomNav = false }: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  screenStyle?: StyleProp<ViewStyle>,
  hasBottomNav?: boolean,
  hasSafeArea?: boolean
}) {
  return hasSafeArea ?(
    <>
      <View style={[spacing.fill, {position: "relative"}]}>
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
      <View style={[spacing.fill, {position: "relative"}]}>
        <StatusBar style="dark"/>
        <View style={[style ?? spacing.fill, screenStyle]}>
          {children}
        </View>
      </View>
    </>
  )
}

export default Screen;
