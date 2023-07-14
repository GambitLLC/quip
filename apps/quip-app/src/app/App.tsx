/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import Home from "../pages/game/Home";
import Info from "../pages/game/Info"
import { theme } from "@quip/native-ui";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../pages/profile/Profile";
import Withdraw from "../pages/wallet/Withdraw";
import Deposit from "../pages/wallet/Deposit";
import Buy from "../pages/wallet/Buy";
import QRCode from "../pages/wallet/QRCode";
import Splash from "../pages/splash/Splash";
import Auth from "../pages/splash/Auth";
import { CryptoProvider } from "@quip/native-ui";
const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <PaperProvider theme={theme}>
      <CryptoProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="splash" screenOptions={{headerShown: false}}>
            <Stack.Screen name="splash" component={Splash}/>
            <Stack.Screen name="auth" component={Auth} />
            <Stack.Screen name="gameHome" component={Home}/>
            <Stack.Screen name="gameInfo" component={Info}/>
            <Stack.Screen name="profile" component={Profile} />
            <Stack.Screen name="withdrawWallet" component={Withdraw}/>
            <Stack.Screen name="depositWallet" component={Deposit}/>
            <Stack.Screen name="buyWallet" component={Buy}/>
            <Stack.Screen name="qrCodeWallet" component={QRCode}/>
          </Stack.Navigator>
        </NavigationContainer>
      </CryptoProvider>
    </PaperProvider>
  );
};

export default App;
