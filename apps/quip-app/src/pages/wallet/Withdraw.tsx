import { View, StyleSheet } from "react-native";
import { Screen, spacing, Text } from "@quip/native-ui";

interface WithdrawProps {

}

export function Withdraw(props: WithdrawProps) {
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill]}>
        <Text>Withdraw</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default Withdraw;
