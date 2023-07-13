import { View, StyleSheet } from "react-native";
import { p } from "../styles/Spacing";
import { Text } from "../text/Text"

interface TransactionHistoryProps {

}

export function TransactionHistory(props: TransactionHistoryProps) {
  return (
    <View style={[p('x', 2)]}>
      <Text>TransactionHistory</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

export default TransactionHistory;
