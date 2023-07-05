import { TextProps, TextStyle } from "react-native";
import theme from "../../theme";
import { Text as PaperText } from "react-native-paper";


export function Text(props: TextProps) {
  console.log("Text", props)
  return (
    <PaperText style={[styles.text, props.style]}>
      {props.children}
    </PaperText>
  )
}

const styles = {
  text: {
    color: theme.colors.s1,
  }
}

export default Text;
