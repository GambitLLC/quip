import { View, StyleSheet, NativeSyntheticEvent, TextInputSubmitEditingEventData } from "react-native";
import { m, p, Screen, spacing, Text } from "@quip/native-ui";
import { Magic } from "@magic-sdk/react-native-expo";
import { Button, TextInput } from "react-native-paper";
import { useState } from "react";
import { SolanaExtension } from "@magic-ext/solana";
import { AuthExtension } from "@magic-ext/auth";

const solanaExtension = new SolanaExtension({
  rpcUrl: 'https://api.devnet.solana.com',
})

const authExtension = new AuthExtension()

const magic = new Magic('pk_live_79385C11B09DBB96', {
  extensions: [
    // @ts-ignore
    solanaExtension,
    // @ts-ignore
    authExtension,
  ]
});

interface AuthProps {

}

type LoginModalState = "login" | "otp" | "loading" | "error"

export function Auth(props: AuthProps) {
  const [state, setState] = useState<LoginModalState>("login")

  function login(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    const email = e.nativeEvent.text

    const loginEvent = magic.auth.loginWithEmailOTP({ email })

    loginEvent
      .on('email-otp-sent', () => {
        setState("otp")
      })
      .on('invalid-email-otp', () => {
        console.log("invalid email otp")
        setState("error")
        loginEvent.emit('cancel');
      })
      .on('done',(result) => {
        console.log(`done ${result}`)
      })
      .on('error', (error) => {
        setState("error")
        console.error(error)
      })
  }

  function logout() {
    magic.user.logout()
  }

  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill]}>
        <View style={[m('a', 6)]}>
          <Text style={[m('b', 2)]}>Auth!</Text>
          <TextInput autoFocus={true} onSubmitEditing={login} keyboardType="email-address" autoComplete={"email"} label="Email Address" placeholder="example@mail.com" mode={"outlined"}/>
        </View>
        <Button onPress={logout}>
          <Text>Logout</Text>
        </Button>
        <magic.Relayer />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default Auth;
