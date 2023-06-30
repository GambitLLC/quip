import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { QuipNavigationProps, spacing } from "@quip/native-ui";
import { Text } from "react-native-paper";
import { Screen } from "@quip/native-ui";

export default function Settings({route, navigation}: NativeStackScreenProps<QuipNavigationProps, "settings">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <Text>
        Settings!
      </Text>
    </Screen>
  )
}
