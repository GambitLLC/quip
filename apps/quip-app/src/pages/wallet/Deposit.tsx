import { View, StyleSheet } from "react-native";
import { m, p, Screen, spacing, Text } from "@quip/native-ui";
import { CryptoNumpadInput } from "@quip/native-ui";

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill]}>
        <Text>Deposit!</Text>
        <View style={[spacing.fill, p('a', 6), m('y', 24)]}>
          <CryptoNumpadInput/>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default Deposit;
