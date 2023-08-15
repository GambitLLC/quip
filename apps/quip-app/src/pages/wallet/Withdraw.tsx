import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Withdraw1} from "./Withdraw1";
import {Withdraw2} from "./Withdraw2";
import {Withdraw3} from "./Withdraw3";
import { IconButton } from "react-native-paper";
import { m } from "@quip/native-ui";
import { useNavigation } from "@react-navigation/native";
const Stack = createNativeStackNavigator();
interface WithdrawProps {

}

export function Withdraw(props: WithdrawProps) {
  const navigation = useNavigation();

  return (
    <Stack.Navigator initialRouteName="withdraw1">
      <Stack.Group>
        <Stack.Screen name="withdraw1" component={Withdraw1} options={{
          title: "Send SOL",
          headerLeft: () => {
            return (
              <IconButton style={[m('l', -2)]} icon="arrow-left" onPress={() => {
                navigation.goBack()
              }}/>
            )
          }
        }} />
        <Stack.Screen name="withdraw2" component={Withdraw2} options={{
          headerShown: false
        }}/>
        <Stack.Screen name="withdraw3" component={Withdraw3} options={{
          headerShown: false
        }}/>
      </Stack.Group>
    </Stack.Navigator>
  )
}

export default Withdraw;

