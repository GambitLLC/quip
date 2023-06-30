import { View, ViewProps, StyleSheet } from "react-native";
import theme from "../../theme";

export function QuipNav(props: ViewProps) {
  return (
    <View style={styles.quipNav} {...props}>

    </View>
  )
}

const styles = StyleSheet.create({
  quipNav: {
    height: 79,
    width: "100%",
    backgroundColor: theme.colors.s5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  }
})

export default QuipNav
