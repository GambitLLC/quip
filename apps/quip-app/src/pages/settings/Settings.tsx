import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { spacing } from "@quip/native-ui";
import { Screen, Text } from "@quip/native-ui";
import { ParamListBase } from "@react-navigation/native";

export default function Settings({route, navigation}: NativeStackScreenProps<ParamListBase, "settings">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <Text>
        Settings!
      </Text>
    </Screen>
  )
}
