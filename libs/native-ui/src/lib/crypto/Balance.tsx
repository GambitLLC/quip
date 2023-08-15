import { View, ViewProps, StyleSheet, PressableProps, Pressable } from "react-native";
import { Text } from "../text/Text"
import { theme } from "../../theme"
import Sol from "../candy/Sol";
import { m, p } from "../styles/Spacing";
import { typography } from "../styles/Typography";
import { useCrypto } from "../context/CryptoContext";
import { useTicker } from "../context/TickerContext";
import { TouchableRipple } from "react-native-paper";

interface BalanceProps {
  onPress: () => void
}

export function Balance(props: BalanceProps) {
  const crypto = useCrypto()

  return (
    <TouchableRipple borderless onPress={props.onPress} style={[styles.balance]}>
      <View style={[styles.balanceRow, p('a', 2), p('r', 4)]}>
        <Sol style={styles.icon}/>
        <Text style={[typography.p3, m('l', 2)]}>
          {crypto.balance} SOL
        </Text>
      </View>
    </TouchableRipple>
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
  balanceRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
