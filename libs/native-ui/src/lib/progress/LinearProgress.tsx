import { View } from "react-native";
import theme from "../../theme";
import {useSpring, animated, UseSpringProps} from "@react-spring/native";

interface LinearProgressProps {
  percentage: number,
  color?: string,
  backgroundColor?: string,
  height?: number,
  borderRadius?: number,
  spring?: UseSpringProps,
}

export function LinearProgress(props: LinearProgressProps) {
  const [style, api] = useSpring(() => (props.spring ?? {
    width: `${props.percentage}%`,
  }), [props.percentage])

  return (
    <View style={{
      position: "relative",
      width: "100%",
      height: props.height ?? 12,
      backgroundColor: props.backgroundColor ?? theme.colors.s5,
      borderRadius: props.borderRadius ?? 9999,
      overflow: "hidden",
    }}>
      <animated.View style={[{
        position: "absolute",
        height: "100%",
        backgroundColor: props.color ?? theme.colors.primary,
        borderRadius: props.borderRadius ?? 9999,
      }, style]}/>
    </View>
  )
}

export default LinearProgress
