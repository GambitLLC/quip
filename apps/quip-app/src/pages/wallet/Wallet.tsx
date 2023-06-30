import { Text } from "react-native-paper";
import { QuipNavigationProps, Screen, spacing } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export default function Wallet({route, navigation}: NativeStackScreenProps<QuipNavigationProps, "wallet">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <Text>
        Wallet!
      </Text>
    </Screen>
  )
}
