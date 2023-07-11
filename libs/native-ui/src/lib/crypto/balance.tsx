import { View, ViewProps, StyleSheet, PressableProps, Pressable } from "react-native";
import { Text } from "../text/text"
import { theme } from "../../theme"
import Sol from "../candy/sol";
import { m, p } from "../styles/spacing";
import { typography } from "../styles/typography";

export function Balance(props: ViewProps & PressableProps & {
  amount: number
}) {
  return (
    <Pressable {...props}>
      <View {...props} style={[styles.balance, p('a', 2), p('r', 4)]}>
        <Sol style={styles.icon}/>
        <Text style={[typography.p3, m('l', 2)]}>
          {props.amount} SOL
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  balance: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.colors.s3
  },
  icon: {
    color: theme.colors.s3,
    width: 20,
    height: 20,
  },
  text: {

  }
})

export default Balance
