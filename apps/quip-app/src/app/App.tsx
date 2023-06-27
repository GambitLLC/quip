/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from "../pages/splash/Splash";
import Register from "../pages/splash/Register";
import Home from "../pages/game/Home";
import { theme } from "@quip/native-ui";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="splash" component={Splash} />
          <Stack.Screen name="register" component={Register} />
          <Stack.Screen name="home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
