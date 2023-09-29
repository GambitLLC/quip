import {View, StyleSheet} from 'react-native'
import {
  spacing,
  Text,
  Screen,
  flex,
  theme,
  useTicker,
  Sol,
  typography,
  m,
  border,
  p,
  ButtonClick
} from "@quip/native-ui";
import { Withdraw3Props } from "./Withdraw";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Button } from "react-native-paper";

export function Withdraw3({navigation, route}: Withdraw3Props) {
  const { usdPrice } = useTicker()
  const { address, amountSol } = route.params

  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <View style={[flex.fillH, flex.fillW, flex.col, flex.alignCenter]}>
        <View style={[border.quip, p('a', 6), m('a', 6), styles.address, flex.row, flex.alignCenter]}>
          <FontAwesome5 name="wallet" size={20} color={theme.colors.p1} style={p('r', 6)}/>
          <Text style={[typography.label2, flex.shrink]}>
            {address}
          </Text>
        </View>
        <View style={flex.grow}/>
        <View style={[flex.row, flex.center, m('b', 2)]}>
          <FontAwesome name="usd" size={40} color={theme.colors.s1} style={{marginBottom: 4, marginRight: 8}}/>
          <Text style={[typography.h3]}>
            {(amountSol * usdPrice).toFixed(2)}
          </Text>
        </View>
        <View style={[flex.row, flex.center, m('b', 28)]}>
          <Sol width={20} height={20} color={theme.colors.s4} style={{marginBottom: 2, marginRight: 4}}/>
          <Text style={[typography.p1, styles.subText]}>
            {amountSol}
          </Text>
        </View>
        <Text style={[{width: 288}, m('b', 14)]}>
          <Text style={[styles.warningTextBold]}>WARNING! </Text>
          <Text style={[styles.warningText]}>
            All withdrawals are final. Please make sure you are sending to the correct address.
          </Text>
        </Text>
        <View style={flex.grow}/>
        <View style={m('b', 12)}>
          <ButtonClick minScale={.85
          } onPress={() => {

          }} mode="contained" style={[{width: 320}]} contentStyle={{height: 56}}>
            <Text style={[typography.button1, {color: theme.colors.white}]}>
              Send
            </Text>
          </ButtonClick>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  address: {
    borderRadius: 24,
  },
  subText: {
    color: theme.colors.s4,
  },
  warningText: {
    color: theme.colors.s4,
    fontSize: 14,
    textAlign: "center",
  },
  warningTextBold: {
    fontFamily: "Co-Headline-700",
    color: theme.colors.s4,
    fontSize: 14,
    textAlign: "center",
  }
})

export default Withdraw3;
