import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/native";
import { Screen, spacing, theme } from "@quip/native-ui";
import { View } from "react-native";
import { Text } from "react-native-paper"

function Profile({navigation}: NativeStackScreenProps<ParamListBase, "profile">) {
  return (
    <Screen screenStyle={[{backgroundColor: theme.colors.background}]} style={[spacing.fill]}>
      <View style={[spacing.center, spacing.fill]}>
        <Text>
          Profile!
        </Text>
      </View>
    </Screen>
  )
}

export default Profile
