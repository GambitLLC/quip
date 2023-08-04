/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import Home from "../pages/game/Home";
import Info from "../pages/game/Info"
import { theme, NotificationBar } from "@quip/native-ui";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../pages/profile/Profile";
import Withdraw from "../pages/wallet/Withdraw";
import Deposit from "../pages/wallet/Deposit";
import Buy from "../pages/wallet/Buy";
import Splash from "../pages/splash/Splash";
import Auth from "../pages/splash/Auth";
import { CryptoProvider } from "@quip/native-ui";
import GameScreen from "../pages/game/GameScreen";
const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <PaperProvider theme={theme}>
      <CryptoProvider>
        <NavigationContainer>
          <NotificationBar>
            <Stack.Navigator initialRouteName="gameHome" screenOptions={{headerShown: false}}>
              <Stack.Group>
                <Stack.Screen name="game" component={GameScreen} />
                <Stack.Screen name="splash" component={Splash}/>
                <Stack.Screen name="auth" component={Auth} />
                <Stack.Screen name="gameHome" component={Home}/>
                <Stack.Screen name="gameInfo" component={Info}/>
                <Stack.Screen name="profile" component={Profile} />
              </Stack.Group>
              <Stack.Group screenOptions={{
                presentation: 'modal',
              }}>
                <Stack.Screen name="depositWallet" component={Deposit}/>
                <Stack.Screen name="withdrawWallet" component={Withdraw}/>
                <Stack.Screen name="buyWallet" component={Buy}/>
              </Stack.Group>
            </Stack.Navigator>
          </NotificationBar>
        </NavigationContainer>
      </CryptoProvider>
    </PaperProvider>
  );
};

export default App;
