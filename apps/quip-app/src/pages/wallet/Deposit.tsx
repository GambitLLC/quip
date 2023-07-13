import { View, StyleSheet } from "react-native";
import { Screen, spacing, Text } from "@quip/native-ui";

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill]}>
        <Text>Deposit!</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default Deposit;
