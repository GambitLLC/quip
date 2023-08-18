import React from "react";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import {Withdraw1} from "./Withdraw1";
import {Withdraw2} from "./Withdraw2";
import {Withdraw3} from "./Withdraw3";
import { WalletModalHeader } from "@quip/native-ui";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import Scanner from "./Scanner";

export type RootStackParamList = {
  withdraw1?: {
    address: string
  },
  withdraw2: {
    address: string,
  },
  withdraw3: undefined,
  scanner: undefined,
}

export type Withdraw1Props = NativeStackScreenProps<RootStackParamList, "withdraw1">
export type Withdraw2Props = NativeStackScreenProps<RootStackParamList, "withdraw2">
export type Withdraw3Props = NativeStackScreenProps<RootStackParamList, "withdraw3">
export type ScannerProps = NativeStackScreenProps<RootStackParamList, "scanner">

const Stack = createNativeStackNavigator<RootStackParamList>();
interface WithdrawProps {

}

export function Withdraw(props: WithdrawProps) {
  const navigation = useNavigation();

  return (
    <Stack.Navigator initialRouteName="withdraw1">
      <Stack.Group screenOptions={{
        presentation: 'modal',
      }}>
        <Stack.Screen name={"scanner"} component={Scanner} options={{
          header: () => <WalletModalHeader prev={() => {
            navigation.dispatch({
              ...CommonActions.navigate("withdraw1"),
            })
          }} prevIcon="close" title="Scan QR Code"/>
        }}/>
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name="withdraw1" component={Withdraw1} options={{
          header: () => <WalletModalHeader prev={() => navigation.goBack()} prevIcon="arrow-left" title="Send SOL"/>
        }} />
        <Stack.Screen name="withdraw2" component={Withdraw2} options={{
          header: () => <WalletModalHeader prev={() => navigation.dispatch({
            ...CommonActions.navigate("withdraw1"),
          })} prevIcon={"arrow-left"} title={"Withdraw"}/>,
        }}/>
        <Stack.Screen name="withdraw3" component={Withdraw3} options={{
          headerShown: false
        }}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
})

export default Withdraw;

