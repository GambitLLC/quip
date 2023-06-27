import { View, ViewProps, StyleSheet } from "react-native";
import { Text } from "react-native-paper"
import { theme } from "../../theme"
import Sol from "../candy/sol";
import { m, p } from "../styles/spacing";
import { typography } from "../styles/typography";

export function Balance(props: ViewProps & {
  amount: number
}) {
  return (
    <View {...props} style={[styles.balance, p('a', 1), p('r', 3)]}>
      <Sol style={styles.icon}/>
      <Text style={[typography.p3, m('l', 2)]}>
        {props.amount} SOL
      </Text>
    </View>
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
