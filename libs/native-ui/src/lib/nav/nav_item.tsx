import { StyleSheet, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, ViewProps } from "react-native";
import theme from "../../theme";
import { IconButton, Text } from "react-native-paper";
import { typography } from "../styles/typography";
import { capitalize } from "../../util/text";
import { m } from "../styles/spacing";
import { animated, useSpring } from "@react-spring/native";

const AnimatedIconButton = animated(IconButton)
const animationTime = 200

interface NavItemProps {
  active: boolean,
  icon: string,
  label: string
}

export function NavItem(props: ViewProps & NavItemProps & TouchableWithoutFeedbackProps) {
  const [springProps, api] = useSpring({
    backgroundColor: props.active ? theme.colors.s2 : theme.colors.s5,
    borderColor: props.active ? theme.colors.s3 : theme.colors.s5,
    config: {
      duration: animationTime
    }
  }, [props.active])

  const [colorProps, colorApi] = useSpring({
    color: props.active ? theme.colors.primary : theme.colors.s4,
    config: {
      duration: animationTime
    }
  }, [props.active])

  const textProps = useSpring({
    maxWidth: props.active ? 100 : 0,
    opacity: props.active ? 1 : 0,
    config: {
      duration: animationTime,
      mass: 10,
      friction: 10000000,
      tension: 1200,
    }
  }, [props.active])

  return (
    <TouchableWithoutFeedback {...props as TouchableWithoutFeedbackProps}>
      <animated.View style={[springProps, styles.navItem]} key={props.label} {...props}>
        <AnimatedIconButton icon={props.icon} iconColor={props.active ? theme.colors.primary : theme.colors.s4}/>
        <animated.Text style={[colorProps, textProps[0], typography.button1, m('r', 6)]}>
          {capitalize(props.label)}
        </animated.Text>
      </animated.View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  navItem: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 0,
    flexShrink: 1,
    alignItems: "center",
    height: 48,
    borderRadius: 9999,
    borderStyle: "solid",
    borderWidth: 1,
  },
})

export default NavItem;
