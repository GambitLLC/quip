import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Withdraw1} from "./Withdraw1";
import {Withdraw2} from "./Withdraw2";
import {Withdraw3} from "./Withdraw3";
const Stack = createNativeStackNavigator();
interface WithdrawProps {

}

export function Withdraw(props: WithdrawProps) {
  return (
    <Stack.Navigator initialRouteName="withdraw1" screenOptions={{headerShown: false}}>
      <Stack.Group>
        <Stack.Screen name="withdraw1" component={Withdraw1} />
        <Stack.Screen name="withdraw2" component={Withdraw2}/>
        <Stack.Screen name="withdraw3" component={Withdraw3} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

export default Withdraw;

