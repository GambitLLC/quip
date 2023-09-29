import { View, StyleSheet } from "react-native";
import { Text } from "../text/Text";
import { p, m } from "../styles/Spacing";
import { border } from "../styles/Border";
import { typography } from "../styles/Typography";
import { TouchableRipple } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome5"
import RippleClick from "../animations/RippleClick";
interface CryptoNumpadInputProps {
  onInput: (n: number) => void,
  onDelete: () => void,
  onDecimal: () => void,
}

export function CryptoNumpadInput(props: CryptoNumpadInputProps) {
  const cols = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [-1, 0, -2]
  ]

  const MapToIcon = ({num} : {num: number}) => num === -1 ? (<Text style={typography.h5}>.</Text>) : <FontAwesome size={28} name="backspace"/>

  function onPress(n: number) {
    if (n === -1) return props.onDecimal()
    if (n === -2) return props.onDelete()

    return props.onInput(n)
  }

  return (
    <View style={{
      width: "100%",
      height: "100%"
    }}>
      <View style={styles.numpadCol}>
        {cols.map((row, i) => {
          return (
            <View key={i} style={[styles.numpadRow, p('y', 1)]}>
              {
                row.map((num, j) => {
                  return (
                    <RippleClick duration={600} minScale={.85 } borderless key={j} style={[styles.numpadKey, border.quip, m('x', 1)]} onPress={() => onPress(num)}>
                      {num === -1 || num === -2 ? <MapToIcon num={num}/> : <Text style={typography.h5}>{num.toString()}</Text>}
                    </RippleClick>
                  )
                })
              }
            </View>
          )
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  numpadCol: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 1
  },

  numpadRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexShrink: 1,
  },

  numpadKey: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: "100%",
    borderRadius: 16,
    flexShrink: 1,
  }
});

export default CryptoNumpadInput;
