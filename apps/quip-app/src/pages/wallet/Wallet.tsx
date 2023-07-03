import { Text } from "react-native-paper";
import { Screen, spacing } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";

export default function Wallet({route, navigation}: NativeStackScreenProps<ParamListBase, "wallet">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <Text>
        Wallet!
      </Text>
    </Screen>
  )
}
