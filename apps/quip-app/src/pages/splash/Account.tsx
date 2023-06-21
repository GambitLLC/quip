import { Text } from "react-native-paper";
import { Button, p, Screen, spacing } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native"

export default function Account({navigation}: NativeStackScreenProps<any, "account">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <View>
        <Text>Account Screen!</Text>
        <Button
          style={[
            p('y', 4),
            p('x', 16),
          ]}
          mode="contained"
          title="Go to Splash!"
          icon="login"
          onPress={() => navigation.navigate("splash")}
        />
      </View>
    </Screen>
  )
}
