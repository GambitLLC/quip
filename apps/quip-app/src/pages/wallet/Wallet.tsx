import { p, Screen, spacing, TopWalletInfo, TransactionHistory } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

export default function Wallet({route, navigation}: NativeStackScreenProps<ParamListBase, "wallet">) {
  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill, p('a', 4)]}>
        <TopWalletInfo/>
        <TransactionHistory/>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({

})
