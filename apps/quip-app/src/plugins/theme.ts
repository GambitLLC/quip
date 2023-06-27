import {configureFonts, MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {Platform} from "react-native";
import {MD3Type} from "react-native-paper/src/types";

const fontConfig = {
  default: {
    fontFamily: Platform.select({
      web: 'Rubik-400, sans-serif',
      ios: 'Rubik-400',
      android: 'Rubik-400',
      default: 'sans-serif',
    }),
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  }
} as Partial<MD3Type>;

export const theme = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig, isV3: true}),
  colors: {
    ...DefaultTheme.colors,
    primary: '#AE50FD'
  }
}
