import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { spacing } from "../styles/spacing";

export function Screen({ children, style, screenStyle, hasSafeArea = true }: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  screenStyle?: StyleProp<ViewStyle>,
  hasSafeArea?: boolean
}) {
  return hasSafeArea ?(
    <>
      <StatusBar style="dark"/>
      <SafeAreaView style={[spacing.fill, screenStyle]}>
        <View style={style ?? spacing.fill}>
          {children}
        </View>
      </SafeAreaView>
    </>
  ) : (
    <>
      <StatusBar style="dark"/>
      <View style={[style ?? spacing.fill, screenStyle]}>
        {children}
      </View>
    </>
  )
}

export default Screen;
