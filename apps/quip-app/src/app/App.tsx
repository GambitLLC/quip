/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import Home from "../pages/game/Home";
import { theme } from "@quip/native-ui";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createQuipNavigator } from "@quip/native-ui";
import Wallet from "../pages/wallet/Wallet";
import Settings from "../pages/settings/Settings";

const Quip = createQuipNavigator();

export const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Quip.Navigator initialRouteName={"home"} quipNavBarStyle={{}} contentStyle={{
          height: "100%",
        }}>
          <Quip.Screen name="games" component={Home} />
          <Quip.Screen name="wallet" component={Wallet} />
          <Quip.Screen name="settings" component={Settings} />
        </Quip.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
