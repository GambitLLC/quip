import { View, StyleSheet, ScrollView } from "react-native";
import { m, } from "../styles/Spacing";
import { useTransactionStore } from "../store/TransactionStore";
import { TransactionDayInfoRow } from "./TransactionDayInfoRow";
import { border } from "../styles/Border";
import { TransactionItemView } from "./TransactionItem";
import theme from "../../theme";

interface TransactionHistoryProps {

}

export function TransactionHistory(props: TransactionHistoryProps) {
  const history = useTransactionStore()


  return (
    <ScrollView decelerationRate={0} showsVerticalScrollIndicator={false}>
      {history.transactions.map((d, i) => {
        return (
          <View key={i} style={[m('t', 4)]}>
            <TransactionDayInfoRow day={d}/>
            <View style={[styles.dayContainer, border.quip]}>
              {d.items.map((t, i) => {
                return (
                  <View key={i}>
                    <TransactionItemView transaction={t}/>
                    {i < (d.items.length-1) && <View style={[styles.divider]}/>}
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dayContainer: {
    borderRadius: 16,
  },

  divider: {
    borderStyle: "solid",
    borderColor: theme.colors.s3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 1,
  },
});

export default TransactionHistory;
