import { StyleSheet, View, ViewProps } from "react-native";
import theme from "../../theme";
import { useSpring, animated } from "@react-spring/native";

interface LinearProgressProps {
  percentage: number
}

export function LinearProgress(props: LinearProgressProps) {
  const [style, api] = useSpring(() => ({
    width: `${props.percentage}%`,
  }), [props.percentage])

  return (
    <View style={styles.container}>
      <animated.View style={[styles.bar, style]}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 12,
    backgroundColor: theme.colors.s5,
    borderRadius: 9999,
    overflow: "hidden",
  },

  bar: {
    position: "absolute",
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 9999,
  }
})

export default LinearProgress
