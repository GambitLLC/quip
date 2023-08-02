import { View, StyleSheet } from "react-native";
import { p } from "../styles/Spacing";
import { shortAddress } from "../../util/TextUtil";
import { Text } from "../text/Text"
import { IconButton } from "react-native-paper";
import theme from "../../theme";
import { TransactionItem } from "../store/TransactionStore";

interface TransactionItemProps {
  transaction: TransactionItem
}

export function TransactionItemView(props: TransactionItemProps) {
  return (
    <View style={[p('y', 6), p('x', 4), styles.transaction]}>
      <IconButton icon="camera" mode="contained"/>
      <View style={[styles.dataCol1]}>
        <Text style={styles.mainText}>{shortAddress(props.transaction.address)}</Text>
        <Text style={styles.subtext}>
          {new Date(props.transaction.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          })}
        </Text>
      </View>
      <View style={[styles.dataCol2]}>
        <Text style={styles.mainText}>
          {props.transaction.amount >= 0 ? "+" : ''}
          {props.transaction.amount} SOL
        </Text>
        <Text style={styles.subtext}>
          {props.transaction.amount >= 0 ? "+" : ''}
          {(props.transaction.priceInUSD * props.transaction.amount).toFixed(2)} USD
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transaction: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dataCol1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  dataCol2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  mainText: {
    fontSize: 16,
  },

  subtext: {
    color: theme.colors.s4,
    fontSize: 14,
  }
});

export default TransactionItemView;
