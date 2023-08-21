import {View, StyleSheet} from "react-native";
import {
  flex,
  m,
  p,
  Screen,
  Sol,
  spacing,
  Text,
  theme,
  typography,
  useCrypto,
  useTicker,
  CryptoNumpadInput,
  ButtonClick, RippleClick
} from "@quip/native-ui";
import {FontAwesome} from "@expo/vector-icons";
import {Button, IconButton, TouchableRipple} from "react-native-paper";
import {CommonActions} from "@react-navigation/native";
import {useMemo, useState} from "react";
import { Withdraw2Props } from "./Withdraw";

function toFixedAtMost(x: number, digits: number) {
  const e = Math.pow(10, digits);
  return Math.round(x * e) / e;
}

const usdMaxDecimalPlaces = 2
const solanaMaxDecimalPlaces = 9
const maxLengthSolana = 12
const maxLengthUsd = 9

export function Withdraw2({navigation, route}: Withdraw2Props) {
  const { usdPrice } = useTicker()
  const { balance } = useCrypto()
  const { address } = route.params

  const [mode, setMode] = useState<'sol' | 'usd'>('usd')

  const [solanaValue, setSolanaValue] = useState('')
  const [usdValue, setUsdValue] = useState('')

  const input = useMemo(() => {
    if (mode === 'usd') {
      return usdValue
    } else {
      return solanaValue
    }
  }, [solanaValue, usdValue, mode])

  const memoPrice = useMemo(() => {
    if (mode === 'usd') {
      return solanaValue
    } else {
      return parseFloat(usdValue).toFixed(2)
    }
  }, [solanaValue, usdValue, mode])

  const isValid = useMemo(() => {
    return parseFloat(solanaValue) > 0 && parseFloat(solanaValue) <= (balance ?? 0)
  }, [solanaValue, balance])

  const usdMaxDecimalPlaces = 2
  const solanaMaxDecimalPlaces = 9
  const maxLengthSolana = 12
  const maxLengthUsd = 9

  function onInput(n: number) {
    if (input.length === 0 && n === 0) return

    const maxLength = mode === 'usd' ? maxLengthUsd : maxLengthSolana
    if (input.length >= maxLength) return

    if (mode === 'usd') {
      if (input.length === 0) {
        setUsdValue(n.toString())
        setSolanaValue(toFixedAtMost(n / usdPrice, 9).toString())
        return
      }

      if (input.includes('.')) {
        const decimalPlaces = input.split('.')[1].length
        if (decimalPlaces >= usdMaxDecimalPlaces) {
          return
        }
      }

      const newSolValue = toFixedAtMost(parseFloat(input + n.toString()) / usdPrice, 9)
      setUsdValue(input + n.toString())
      setSolanaValue(newSolValue.toString())
    } else {
      if (input.length === 0) {
        setSolanaValue(n.toString())
        setUsdValue(toFixedAtMost(n * usdPrice, 2).toString())
        return
      }

      if (input.includes('.')) {
        const decimalPlaces = input.split('.')[1].length
        if (decimalPlaces >= solanaMaxDecimalPlaces) {
          return
        }
      }

      const newUsdValue = toFixedAtMost(parseFloat(input + n.toString()) * usdPrice, 9)
      setSolanaValue(input + n.toString())
      setUsdValue(newUsdValue.toString())
    }
  }

  function onDecimal() {
    if (input.includes('.')) return

    if (input.length === 0) {
      if (mode === 'usd') {
        setUsdValue('0.')
        setSolanaValue('0')
      } else {
        setSolanaValue('0.')
        setUsdValue('0')
      }
      return
    } else {
      if (mode === 'usd') {
        const newSolValue = toFixedAtMost(parseFloat(input) / usdPrice, 9)
        setUsdValue(input + '.')
        setSolanaValue(newSolValue.toString())
      } else {
        const newUsdValue = toFixedAtMost(parseFloat(input) * usdPrice, 2)
        setSolanaValue(input + '.')
        setUsdValue(newUsdValue.toString())
      }
    }
  }

  function onDelete() {
    if (mode === 'usd') {
      const newSolValue = toFixedAtMost(parseFloat(input.slice(0, -1)) / usdPrice, 9)
      setUsdValue(input.slice(0, -1))

      if (isNaN(newSolValue)) {
        setSolanaValue('')
      } else {
        setSolanaValue(newSolValue.toString())
      }
    } else {
      const newUsdValue = toFixedAtMost(parseFloat(input.slice(0, -1)) * usdPrice, 2)
      setSolanaValue(input.slice(0, -1))

      if (isNaN(newUsdValue)) {
        setUsdValue('')
      } else {
        setUsdValue(newUsdValue.toString())
      }
    }
  }

  function swap() {
    if (mode === 'usd') {
      setMode('sol')

    } else {
      setMode('usd')
    }
  }

  function max() {
    setSolanaValue((balance ?? 0).toString())
    setUsdValue(toFixedAtMost((balance ?? 0) * usdPrice, 2).toString())
  }

  function fontSize() {
    if (input.length > 10) {
      return {
        fontSize: 18,
        lineHeight: 18,
        letterSpacing: 0,
        fontFamily: 'Co-Headline-700'
      }
    } else if (input.length > 8) {
      return {
        fontSize: 26,
        lineHeight: 26,
        letterSpacing: 0,
        fontFamily: 'Co-Headline-700'
      }
    } else if (input.length > 4) {
      return typography.h5
    } else {
      return typography.h4
    }
  }

  function iconSize() {
    if (input.length > 10) {
      return 18
    } else if (input.length > 8) {
      return 22
    } else if (input.length > 4) {
      return 28
    } else {
      return 32
    }
  }

  function margin() {
    if (input.length > 9) {
      return m('b', 0)
    } else if (input.length > 4) {
      return m('b', 1)
    } else {
      return m('b', 1)
    }
  }

  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <View style={[spacing.fill, p('a', 4), p('t', 10)]}>
        <View style={[p('a', 6), styles.depositHeader]}>
          <View style={styles.depositHeaderRow}>
            <RippleClick minScale={.8} borderless onPress={max} style={styles.depositButton}>
              <Text style={styles.maxText}>MAX</Text>
            </RippleClick>
            <View style={styles.info}>
              <Text style={styles.subtext}>{
                mode === 'usd' ? 'USD' : 'SOL'
              }</Text>
              <View style={[flex.row, flex.alignCenter]}>
                {
                  mode === 'usd' ? (
                    <FontAwesome color={theme.colors.s1} size={iconSize()} style={[margin(), m('r', 1)]} name="usd"/>
                  ) : (
                    <Sol color={theme.colors.s1} width={iconSize()} height={iconSize()} style={[m('b', 1), m('r', 1)]}/>
                  )
                }
                <Text style={[fontSize(), p('y', 2)]}>{input.length !== 0 ? input : '0'}</Text>
              </View>
              <View style={[flex.row, flex.alignCenter]}>
                {
                  mode === 'usd' ? (
                    <Sol color={theme.colors.s4} width={14} height={14} style={{marginBottom: 2, marginRight: 2}}/>
                  ) : (
                    <FontAwesome color={theme.colors.s4} size={13} style={{marginBottom: 2, marginRight: 2}} name="usd"/>
                  )
                }
                <Text style={styles.subtext}>{input.length !== 0 ? `${memoPrice}` : '0'} {mode !== 'usd' ? 'USD' : 'SOL'}</Text>
              </View>
            </View>
            <RippleClick minScale={.8} borderless onPress={swap} style={styles.depositButton}>
              <FontAwesome color={theme.colors.p1} size={16} name="refresh"/>
            </RippleClick>
          </View>
        </View>
        <View style={[flex.col, flex.shrink, m('y', 10)]}>
          <CryptoNumpadInput
            onInput={onInput}
            onDelete={onDelete}
            onDecimal={onDecimal}
          />
        </View>
        <View style={m('b', 8)}>
          <ButtonClick
            minScale={.85}
            disabled={!isValid} onPress={() => {
            navigation.navigate("withdraw3", {
              address: address,
              amountSol: parseFloat(solanaValue),
            })
          }} mode="contained" style={{width: "100%"}} contentStyle={{height: 56}}>
            <Text style={[typography.button1, {color: theme.colors.white}]}>
              Next
            </Text>
          </ButtonClick>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  depositHeader: {
    backgroundColor: theme.colors.s5,
    borderRadius: 16,
    minHeight: 148
  },

  depositHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100
  },

  depositButton: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },

  maxText: {
    fontSize: 14,
    color: theme.colors.p1,
  },

  subtext: {
    fontSize: 14,
    color: theme.colors.s4,
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
});

export default Withdraw2;

