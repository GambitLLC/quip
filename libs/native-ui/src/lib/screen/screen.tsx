import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { spacing } from "../styles/spacing";

export function Screen({ children, style }: {
  children: React.ReactNode,
  style?: StyleProp<ViewStyle>,
}) {
  return (
    <>
      <StatusBar style="dark"/>
      <SafeAreaView style={spacing.fill}>
        <View style={style ?? spacing.fill}>
          {children}
        </View>
      </SafeAreaView>
    </>
  )
}

export default Screen;
