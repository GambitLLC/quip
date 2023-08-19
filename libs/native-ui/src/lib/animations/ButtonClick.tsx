import { StyleSheet } from "react-native";
import { TouchableRipple } from "react-native-paper";
import React, {useState} from "react";
import { animated, easings, useSpring } from "@react-spring/native";

interface ButtonClickProps extends React.ComponentPropsWithRef<typeof TouchableRipple> {

}

const AnimatedTouchableRipple = animated(TouchableRipple)

export function ButtonClick(props: ButtonClickProps) {
  const [isHovering, setIsHovering] = useState(false)

  const minScale = .75

  const {scale} = useSpring({
    scale: isHovering ? minScale : 1,
    config: {
      duration: 1000,
      easing: easings.easeOutElastic
    }
  })


  return (
    <AnimatedTouchableRipple
      {...props}
      style={[props.style, {
        transform: [
          {scale: scale.to([0, 1], [minScale, 1])}
        ]
      }]}
      onPressIn={(e) => {
        console.log("onPressIn")
        setIsHovering(true)
        props.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        console.log("onPressOut")
        setIsHovering(false)
        props.onPressOut?.(e)
      }}
    >
      {props.children}
    </AnimatedTouchableRipple>
  );
}

const styles = StyleSheet.create({});

export default ButtonClick;
