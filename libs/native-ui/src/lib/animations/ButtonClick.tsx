import { Button } from "react-native-paper";
import React, {useState} from "react";
import { animated, easings, useSpring } from "@react-spring/native";

interface ButtonClickProps extends React.ComponentPropsWithRef<typeof Button> {
  duration?: number
  minScale?: number
  easing?: (t: number) => number
}

const AnimatedButton = animated(Button)

export function ButtonClick(props: ButtonClickProps) {
  const [isHovering, setIsHovering] = useState(false)

  const minScale = props.minScale ?? .75
  const duration = props.duration ?? 1000
  const easing = props.easing ?? easings.easeOutElastic

  const {scale} = useSpring({
    scale: isHovering ? minScale : 1,
    config: {
      duration: duration,
      easing: easing
    }
  })


  return (
    <AnimatedButton
      {...props}
      style={[props.style, {
        transform: [
          {scale: scale.to([0, 1], [minScale, 1])}
        ]
      }]}
      onPressIn={(e) => {
        setIsHovering(true)
        props.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        setIsHovering(false)
        props.onPressOut?.(e)
      }}
    >
      {props.children}
    </AnimatedButton>
  );
}

export default ButtonClick;
