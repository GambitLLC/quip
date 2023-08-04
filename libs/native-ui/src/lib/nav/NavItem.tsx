import { StyleSheet, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View, ViewProps } from "react-native";
import { useState } from "react";
import theme from "../../theme";
import {IconButton, TouchableRipple} from "react-native-paper";
import { typography } from "../styles/Typography";
import { capitalize } from "../../util/TextUtil";
import { animated, useSpring, easings } from "@react-spring/native";

const AnimatedIconButton = animated(IconButton)
const animationTime = 280

interface NavItemProps {
  active: boolean,
  icon: string,
  label: string
}

export function NavItem(props: ViewProps & NavItemProps & TouchableWithoutFeedbackProps) {
  const [isPressedIn, setIsPressedIn] = useState(false)

  // const [rippleProps, rippleApi] = useSpring({
  //   opacity: isPressedIn ? 1 : 0,
  //   width: isPressedIn ? "100%" : "0%",
  //   height: isPressedIn ? "100%" : "0%",
  //   config: {
  //     duration: 10,
  //     friction: 12,
  //     tension: 180,
  //     easing: easings.easeInOutCubic
  //   }
  // }, [isPressedIn])

  const [springProps, api] = useSpring({
    backgroundColor: props.active ? theme.colors.s2 : theme.colors.s5,
    borderColor: props.active ? theme.colors.s3 : theme.colors.s5,
    config: {
      duration: animationTime,
      friction: 12,
      tension: 180,
      easing: easings.easeInOutCubic
    },
  }, [props.active])

  const [colorProps, colorApi] = useSpring({
    color: props.active ? theme.colors.primary : theme.colors.s4,
    config: {
      duration: animationTime,
      friction: 12,
      tension: 180,
      easing: easings.easeInOutCubic
    }
  }, [props.active])

  const [textProps, textApi] = useSpring({
    maxWidth: props.active ? 100 : 0,
    marginRight: props.active? 24 : 0,
    opacity: props.active ? 1 : 0,
    config: {
      duration: animationTime,
      friction: 12,
      tension: 180,
      easing: easings.easeOutCubic
    }
  }, [props.active])

  return (
    <TouchableRipple borderless style={{borderRadius: 9999}} onPressIn={() => setIsPressedIn(true)} onPressOut={() => setIsPressedIn(false)} {...props as TouchableWithoutFeedbackProps}>
      <animated.View style={[springProps, styles.navItem]} key={props.label} {...props}>
        {/*<animated.View style={[rippleProps, styles.rippleEffect]}/>*/}
        <AnimatedIconButton icon={props.icon} iconColor={props.active ? theme.colors.primary : theme.colors.s4}/>
        <animated.Text style={[colorProps, textProps, typography.button1]}>
          {capitalize(props.label)}
        </animated.Text>
      </animated.View>
    </TouchableRipple>
  )
}

const styles = StyleSheet.create({
  navItem: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 9999,
    borderStyle: "solid",
    borderWidth: 1,
    position: "relative",
  },
  rippleEffect: {
    position: "absolute",
    backgroundColor: theme.colors.p1,
    borderRadius: 9999,
    opacity: 0.2,
    zIndex: 5
  }
})

export default NavItem;
