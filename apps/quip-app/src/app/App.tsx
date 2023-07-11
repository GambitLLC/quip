/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import Home from "../pages/game/Home";
import Info from "../pages/game/Info"
import { theme } from "@quip/native-ui";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../pages/profile/Profile";
const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="gameHome" component={Home}/>
          <Stack.Screen name="gameInfo" component={Info}/>
          <Stack.Screen name="profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
