import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Withdraw1} from "./Withdraw1";
import {Withdraw2} from "./Withdraw2";
import {Withdraw3} from "./Withdraw3";
import { Button, IconButton } from "react-native-paper";
import { flex, m, p, Text, theme, typography } from "@quip/native-ui";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import Scanner from "./Scanner";
const Stack = createNativeStackNavigator();
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
          header: () => {
            return (
              <View style={[
                flex.row,
                flex.alignCenter,
                flex.spaceBetween,
                p('y', 1),
                p('x', 2),
                {
                  backgroundColor: theme.colors.white
                }
              ]}>
                <IconButton
                  icon="arrow-left"
                  iconColor={theme.colors.s1}
                  onPress={() => {
                    navigation.goBack()
                  }}
                  rippleColor="#14171F20"
                />
                <Text style={[typography.h6]}>
                  Send SOL
                </Text>
                <Button
                  onPress={() => {
                    navigation.dispatch({
                      ...CommonActions.navigate("withdraw2"),
                    })
                  }}
                  mode="text"
                  rippleColor="#14171F20"
                >
                  <Text style={[typography.p1]}>
                    Next
                  </Text>
                </Button>
              </View>
            )
          },
        }}/>
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name="withdraw1" component={Withdraw1} options={{
          header: () => {
            return (
              <View style={[
                flex.row,
                flex.alignCenter,
                flex.spaceBetween,
                p('y', 1),
                p('x', 2)
              ]}>
                <IconButton
                  icon="arrow-left"
                  iconColor={theme.colors.s1}
                  onPress={() => {
                    navigation.goBack()
                  }}
                  rippleColor="#14171F20"
                />
                <Text style={[typography.h6]}>
                  Send SOL
                </Text>
                <Button
                  onPress={() => {
                    navigation.dispatch({
                      ...CommonActions.navigate("withdraw2"),
                    })
                  }}
                  mode="text"
                  rippleColor="#14171F20"
                >
                  <Text style={[typography.p1]}>
                    Next
                  </Text>
                </Button>
              </View>
            )
          },
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

const styles = StyleSheet.create({
})

export default Withdraw;

