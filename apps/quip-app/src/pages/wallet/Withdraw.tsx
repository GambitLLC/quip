import {View, StyleSheet, Pressable} from "react-native";
import {flex, m, p, Screen, Sol, spacing, Text, theme, typography} from "@quip/native-ui";
import { CryptoNumpadInput } from "@quip/native-ui";
import {FontAwesome} from "@expo/vector-icons";
import {Button, IconButton, TouchableRipple} from "react-native-paper";
import {useNavigation} from "@react-navigation/native";
import {useMemo, useState} from "react";

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  const navigation = useNavigation();
  const pricePerSol = 20.0

  const [mode, setMode] = useState<'sol' | 'usd'>('usd')
  const [input, setInput] = useState('')
  const memoPrice = useMemo(() => {
    if (mode === 'usd') {
      return (parseFloat(input) / pricePerSol)
    } else {
      return (parseFloat(input) * pricePerSol).toFixed(2)
    }
  }, [mode, input])

  const usdMaxDecimalPlaces = 2
  const solanaMaxDecimalPlaces = 9
  const maxLength = 12

  function onInput(n: number) {
    if (input.length >= maxLength) return
    if (mode === 'usd') {
      if (input.length === 0) {
        setInput(n.toString())
        return
      }

      if (input.includes('.')) {
        const decimalPlaces = input.split('.')[1].length
        if (decimalPlaces >= usdMaxDecimalPlaces) {
          return
        }
      }

      setInput(input + n.toString())
      return
    } else {
      if (input.length === 0) {
        setInput(n.toString())
        return
      }

      if (input.includes('.')) {
        const decimalPlaces = input.split('.')[1].length
        if (decimalPlaces >= solanaMaxDecimalPlaces) {
          return
        }
      }

      setInput(input + n.toString())
      return
    }
  }

  function onDecimal() {
    if (input.includes('.')) return

    if (input.length === 0) {
      setInput('0.')
      return
    } else {
      setInput(input + '.')
    }
  }

  function onDelete() {
    setInput(input.slice(0, -1))
  }

  function swap() {
    if (mode === 'usd') {
      setMode('sol')
    } else {
      setMode('usd')
    }
  }

  function max() {

  }

  function fontSize() {
    if (input.length > 8) {
      return typography.h6
    } else if (input.length > 4) {
      return typography.h5
    } else {
      return typography.h4
    }
  }

  function iconSize() {
    if (input.length > 8) {
      return 18
    } else if (input.length > 4) {
      return 28
    } else {
      return 32
    }
  }

  return (
    <Screen style={[spacing.fill]}>
      <View style={[spacing.fill, p('a', 4)]}>
        <View style={[p('a', 6), styles.depositHeader]}>
          <View style={[styles.depositHeaderRow, m('b', 4)]}>
            <IconButton iconColor={theme.colors.s1} size={24} icon="close" onPress={() => {
              navigation.goBack();
            }}/>
            <Text style={typography.h6}>Withdraw</Text>
            <IconButton icon="" onPress={() => {}}/>
          </View>
          <View style={styles.depositHeaderRow}>
            <TouchableRipple borderless onPress={max} style={styles.depositButton}>
              <Text style={styles.maxText}>MAX</Text>
            </TouchableRipple>
            <View style={styles.info}>
              <Text style={styles.subtext}>{
                mode === 'usd' ? 'USD' : 'SOL'
              }</Text>
              <View style={{flexDirection: "row", display: "flex", alignItems:"center"}}>
                {
                  mode === 'usd' ? (
                    <FontAwesome size={iconSize()} style={[m('b', 1), m('r', 1)]} name="usd"/>
                  ) : (
                    <Sol color={theme.colors.s1} width={iconSize()} height={iconSize()} style={[m('b', 1), m('r', 1)]}/>
                  )
                }
                <Text style={[fontSize(), p('y', 2)]}>{input.length !== 0 ? input : '0'}</Text>
              </View>
              <Text style={styles.subtext}>{input.length !== 0 ? `~${memoPrice}` : '0'} {mode !== 'usd' ? 'USD' : 'SOL'}</Text>
            </View>
            <TouchableRipple borderless onPress={swap} style={styles.depositButton}>
              <FontAwesome color={theme.colors.p1} size={16} name="refresh"/>
            </TouchableRipple>
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
          <Button mode="contained" style={{width: "100%"}} contentStyle={{height: 56}}>
            <Text style={[typography.button1, {color: theme.colors.white}]}>
              Next
            </Text>
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  depositHeader: {
    backgroundColor: theme.colors.s5,
    borderRadius: 16,
  },

  depositHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default Deposit;

