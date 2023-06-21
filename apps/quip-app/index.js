import { registerRootComponent } from 'expo';
import App from './src/app/App';
import { PaperProvider } from "react-native-paper";
import { theme } from "./src/plugins/theme";
import { NavigationContainer } from "@react-navigation/native";


export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <App/>
      </NavigationContainer>
    </PaperProvider>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Main);
