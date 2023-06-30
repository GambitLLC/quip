import {StyleSheet, View, ViewProps} from "react-native";
import { Text } from "react-native-paper"

export function Slider(props: ViewProps) {
  return (
    <View style={[styles.slider]} {...props}>
      <Text>
        Slider
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  slider: {
    height: 304,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  }
})

export default Slider
