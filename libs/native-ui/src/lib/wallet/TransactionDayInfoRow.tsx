import { View, StyleSheet } from "react-native";
import { m } from "../styles/Spacing";
import { Text } from "../text/Text"
import { TransactionDay } from "../store/TransactionStore";
import theme from "../../theme";

interface TransactionDayInfoRowProps {
  day: TransactionDay
}

export function TransactionDayInfoRow(props: TransactionDayInfoRowProps) {
  const dateString = new Date(props.day.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })

  const daySum = props.day.items.reduce((acc, t) => {
    return acc + (t.amount * t.priceInUSD)
  }, 0)

  return (
    <View style={[styles.transactionDayRow, m('y', 2)]}>
      <Text style={styles.transactionRowText}>{dateString}</Text>
      <Text style={[styles.transactionRowText, daySum >= 0 ? styles.positive : styles.negative]}>
        {daySum >= 0 ? '+' : ''}
        {daySum.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionDayRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  transactionRowText: {
    fontSize: 12,
  },

  positive: {
    color: theme.colors.p2
  },

  negative: {
    color: theme.colors.t2
  }

});

export default TransactionDayInfoRow;
