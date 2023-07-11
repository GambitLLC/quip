import { View, ViewProps } from "react-native";

export function Circle(props: ViewProps) {
  return (
    <View {...props} style={[{
      borderRadius: 9999
    }, props.style]}/>
  )
}

export default Circle;
