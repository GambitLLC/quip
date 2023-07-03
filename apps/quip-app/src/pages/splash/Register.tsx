import { Button, Text } from "react-native-paper";
import { p, Screen, spacing } from "@quip/native-ui";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { ParamListBase } from "@react-navigation/native";

export default function Register({navigation}: NativeStackScreenProps<ParamListBase, "register">) {
  return (
    <Screen style={[spacing.fill, spacing.center]}>
      <View style={styles.getStarted}>

      </View>
      <View>

      </View>
      <View>

      </View>
      <View style={styles.bottomBar}>

      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  getStarted: {

  },

  bottomBar: {

  }
})
