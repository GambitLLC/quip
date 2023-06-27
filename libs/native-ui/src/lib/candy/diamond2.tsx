import Svg, { Path, SvgProps } from "react-native-svg";

export function Diamond2(props: SvgProps) {
  return (
    <Svg {...props} width="23" height="31" viewBox="0 0 23 31" fill="none">
      <Path d="M11.2599 2.11816C10.7262 7.39942 8.0309 17.9619 1.51953 17.9619" stroke="#14171F" strokeWidth="3" strokeLinecap="round"/>
      <Path d="M11.2596 29.4712C11.7934 23.6917 14.4886 12.1327 21 12.1327" stroke="#14171F" strokeWidth="3" strokeLinecap="round"/>
      <Path d="M11.2596 1.96875C11.7934 5.35672 14.4886 12.1327 21 12.1327" stroke="#14171F" strokeWidth="3" strokeLinecap="round"/>
      <Path d="M11.2599 29.4712C10.7262 25.6846 8.0309 18.1115 1.51953 18.1115" stroke="#14171F" strokeWidth="3" strokeLinecap="round"/>
    </Svg>
  )
}

export default Diamond2
