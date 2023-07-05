import { TextStyle } from "react-native";

interface Typography {
  d1: TextStyle,
  h1: TextStyle,
  h2: TextStyle,
  h3: TextStyle,
  h4: TextStyle,
  h5: TextStyle,
  h6: TextStyle,
  p1: TextStyle,
  p2: TextStyle,
  p3: TextStyle,
  p4: TextStyle,
  t1: TextStyle,
  t2: TextStyle,
  label1: TextStyle,
  label2: TextStyle,
  button1: TextStyle,
  button2: TextStyle,
  button3: TextStyle,
}

const typography: Typography = {
  d1: {
    fontSize: 124,
    lineHeight: 124 * 1.2,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h1: {
    fontSize: 80,
    lineHeight: 80,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h2: {
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h3: {
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h4: {
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h5: {
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  h6: {
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  p1: {
    fontSize: 18,
    lineHeight: 1.4 * 18,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-400'
  },
  p2: {
    fontSize: 16,
    lineHeight: 1.4 * 16,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-400'
  },
  p3: {
    fontSize: 14,
    lineHeight: 1.4 * 14,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-400'
  },
  p4: {
    fontSize: 12,
    lineHeight: 1.4 * 12,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-400'
  },
  t1: {
    fontSize: 24,
    lineHeight: 1.4 * 24,
    letterSpacing: 0,
    fontFamily: 'Lexend-400'
  },
  t2: {
    fontSize: 18,
    lineHeight: 1.4 * 18,
    letterSpacing: 0,
    fontFamily: 'Lexend-400'
  },
  label1: {
    fontSize: 20,
    lineHeight: 1.4 * 20,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  label2: {
    fontSize: 12,
    lineHeight: 1.4 * 12,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  button1: {
    fontSize: 18,
    lineHeight: 1.4 * 18,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  button2: {
    fontSize: 14,
    lineHeight: 1.4 * 14,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
  button3: {
    fontSize: 12,
    lineHeight: 1.4 * 12,
    letterSpacing: 0,
    fontFamily: 'Co-Headline-700'
  },
}

export {
  typography
}
