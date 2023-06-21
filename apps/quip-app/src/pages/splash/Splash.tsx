import { Text } from "react-native-paper";
import { Button, p, Screen, spacing } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native"

export default function Splash({navigation}: NativeStackScreenProps<any, "splash">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <View>
        <Text>Slash Screen!</Text>
        <Button
          style={[
            p('y', 4),
            p('x', 16),
          ]}
          mode="contained"
          title="Go to Account!"
          icon="login" onPress={() => navigation.navigate("account")}
        />
      </View>
    </Screen>
  )
}
