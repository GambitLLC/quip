import { View, StyleSheet, NativeSyntheticEvent, TextInputSubmitEditingEventData } from "react-native";
import { m, p, Screen, spacing, Text, useCrypto } from "@quip/native-ui";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";


interface AuthProps {

}

type LoginModalState = "login" | "otp" | "loading" | "error"

export function Auth(props: AuthProps) {
  const [state, setState] = useState<LoginModalState>("login")
  const { magic, init } = useCrypto()

  const navigation = useNavigation()

  function login(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    const email = e.nativeEvent.text

    console.log(magic.config)
    console.log(email)

    const loginEvent = magic.auth.loginWithEmailOTP({ email })

    loginEvent
      .on('email-otp-sent', () => {
        console.log("otp set!")
        setState("otp")
      })
      .on('invalid-email-otp', () => {
        console.log("invalid email otp")
        setState("error")
        loginEvent.emit('cancel');
      })
      .on('done',async (result) => {
        console.log(`done ${result}`)

        await init()
        navigation.dispatch({
          ...CommonActions.navigate("gameHome"),
        })
      })
      .on('error', (error) => {
        setState("error")
        console.error(error)
      })
  }

  function logout() {
    magic.user.logout()
    console.log("logged out")
  }

  return (
    <Screen style={[spacing.fill, styles.container]}>
      <magic.Relayer/>
      <View style={[spacing.fill]}>
        <View style={[m('a', 6)]}>
          <Text style={[m('b', 2)]}>Auth!</Text>
          <TextInput autoFocus={true} onSubmitEditing={login} keyboardType="email-address" autoComplete={"email"} label="Email Address" placeholder="example@mail.com" mode={"outlined"}/>
        </View>
        <Button onPress={logout}>
          <Text>Logout</Text>
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  magic: {
    position: "absolute",
    width: "100%",
    height: "100%",
  }
});

export default Auth;
