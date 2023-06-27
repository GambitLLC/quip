import { registerRootComponent } from 'expo';
import App from './src/app/App';
import { PaperProvider } from "react-native-paper";
import { theme } from "./src/plugins/theme";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {View} from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Main() {
  const [fontsLoaded] = useFonts({
    'Rubik-300': require('./assets/fonts/Rubik-Light.ttf'),
    'Rubik-400': require('./assets/fonts/Rubik-Regular.ttf'),
    'Rubik-500': require('./assets/fonts/Rubik-Medium.ttf'),
    'Rubik-600': require('./assets/fonts/Rubik-SemiBold.ttf'),
    'Rubik-700': require('./assets/fonts/Rubik-Bold.ttf'),
    'Rubik-800': require('./assets/fonts/Rubik-ExtraBold.ttf'),
    'Rubik-900': require('./assets/fonts/Rubik-Black.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  console.log(fontsLoaded)

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{flex: 1, height: "100%", width: "100%" }} onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <App/>
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);
