import {configureFonts, MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {Platform} from "react-native";

const fontConfig = {
  default: {
    fontFamily: Platform.select({
      web: 'Co-Headline-400, sans-serif',
      ios: 'Co-Headline-400',
      android: 'Co-Headline-400',
      default: 'sans-serif',
    }),
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 22,
    fontSize: 20,
  }
} as const;

export const theme = {
  ...DefaultTheme,
  roundness: 5,
  fonts: configureFonts({config: fontConfig, isV3: true}),
  colors: {
    ...DefaultTheme.colors,
    primary: '#AE50FD',
    background: '#FFFFFF',
    white: '#FFFFFF',
    p1: '#AE50FD',
    p2: '#6AB26C',
    s1: '#14171F',
    s2: '#FFFFFF',
    s3: '#B8CEDD',
    s4: '#98A7B1',
    s5: '#ECEBFF',
    s6: '#EEFFEF',
    t1: '#4097A0',
    t2: '#DC3C2D',
    splash: '#E1DFFF',
    success: '#43c756',
    warning: '#eabe0c',
    error: '#fc6969',
    info: '#2196f3',
  }
}

export default theme
