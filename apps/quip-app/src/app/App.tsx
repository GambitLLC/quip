/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { StyleSheet, View, } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from "../pages/splash/Splash";
import Account from "../pages/splash/Account";

const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="account" component={Account} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: "100%",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  button: {
    width: "100%",
    height: 48,
  }
});

export default App;
