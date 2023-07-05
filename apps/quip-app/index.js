import { registerRootComponent } from 'expo';
import App from './src/app/App';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {View} from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Main() {
  const [fontsLoaded] = useFonts({
    'Co-Headline-300': require('./assets/fonts/Co-Headline-Light.otf'),
    'Co-Headline-400': require('./assets/fonts/Co-Headline-Regular.otf'),
    'Co-Headline-700': require('./assets/fonts/Co-Headline-Bold.otf'),
    'Lexend-300': require('./assets/fonts/Lexend-Light.ttf'),
    'Lexend-400': require('./assets/fonts/Lexend-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{flex: 1, height: "100%", width: "100%" }} onLayout={onLayoutRootView}>
      <App/>
    </View>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);
