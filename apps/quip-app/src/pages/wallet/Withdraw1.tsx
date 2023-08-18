import { spacing, Screen, Text, theme, typography, flex, m, border, PasteItem, p } from "@quip/native-ui";
import { StyleSheet, TextInput, View } from "react-native";
import { Withdraw1Props } from "./Withdraw";
import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "react-native"
import { PublicKey } from "@solana/web3.js";
import { FontAwesome } from "@expo/vector-icons";
import { Button, TouchableRipple } from "react-native-paper";
import * as Clipboard from 'expo-clipboard';
import { animated, useSpring } from "@react-spring/native";

const AnimatedTextInput = animated(TextInput)
const AnimatedFontAwesome = animated(FontAwesome)

export function Withdraw1({route, navigation}: Withdraw1Props) {
  const textInputRef = useRef<TextInput>(null)
  const [address, setAddress] = useState(route.params?.address ?? "")
  const [isSelected, setIsSelected] = useState(false)

  const [textStyle, textApi] = useSpring(() => ({
    borderColor: isSelected ? theme.colors.p1 : theme.colors.s3,
    borderBottomWidth: isSelected ? 2 : 1,
  }), [isSelected])

  const [qrStyle, qrApi] = useSpring(() => ({
    color: isSelected ? theme.colors.p1 : theme.colors.s3,
  }), [isSelected])

  useEffect(() => {
    if (!textInputRef.current || !route.params?.address) return
    textInputRef.current.blur()
  }, [textInputRef, route.params?.address])

  useEffect(() => {
    setAddress(route.params?.address ?? "")
  }, [route.params?.address])

  const isValidAddress = useMemo(() => {
    let isValid: boolean
    try {
      const pubKey = new PublicKey(address)
      isValid = PublicKey.isOnCurve(pubKey)
    } catch (e) {
      isValid = false
    }

    return isValid
  }, [address])

  const [clipboardString, setClipboardString] = useState("")

  useEffect(() => {
    Clipboard.getStringAsync().then((res) => {
      try {
        const pubKey = new PublicKey(res)
        if (PublicKey.isOnCurve(pubKey)) {
          setClipboardString(res)
        } else {
          setClipboardString("")
        }
      } catch (e) {
        setClipboardString("")
      }
    })
  }, [])

  return (
    <Screen hasSafeArea={false} style={[spacing.fill]}>
      <animated.View style={[flex.fillW, styles.textBorder, flex.row, flex.alignCenter, flex.spaceBetween, textStyle]}>
        <AnimatedTextInput
          ref={textInputRef}
          onFocus={() => setIsSelected(true)}
          onBlur={() => setIsSelected(false)}
          onChangeText={setAddress}
          value={address}
          style={[styles.textInput, typography.p2, flex.grow, flex.shrink]}
          placeholder="Solana Address"
          autoComplete={"off"}
          autoCorrect={false}
          autoCapitalize={"none"}
          selectionColor={theme.colors.p1}
          clearButtonMode={"always"}
        />
        <TouchableRipple rippleColor={isSelected ? "#AE50FD20" : undefined} borderless onPress={ !isValidAddress ? () => {
          Keyboard.dismiss()
          navigation.navigate("scanner")
        } : undefined} style={[styles.iconButton, flex.row, flex.center, m('x', 3)]}>
          {
            address.length === 0 ? (
              <AnimatedFontAwesome size={24} color={theme.colors.p1} name="qrcode"/>
            ) : (
              isValidAddress ? (
                <AnimatedFontAwesome name={"check-circle"} size={24} color={theme.colors.success}/>
              ) : (
                <AnimatedFontAwesome name={"exclamation-circle"} size={24} color={theme.colors.error}/>
              )
            )
          }
        </TouchableRipple>
      </animated.View>
      <View style={[flex.fillH, flex.fillW, flex.col, flex.spaceBetween, flex.shrink, flex.alignCenter, p('b', 12)]}>
        {
          clipboardString.length > 0 ? (
            <PasteItem
              style={[{width: 320}, m('y', 4)]}
              onPress={() => {
                setAddress(clipboardString)
                textInputRef.current?.blur()
              }}
              value={clipboardString}
            />
          ) : (
            <View style={flex.grow}/>
          )
        }
        <Button disabled={!isValidAddress} style={[{width: 320}]} contentStyle={{height: 56}} mode={"contained"} onPress={() => {
          navigation.navigate("withdraw2", {
            address,
          })
        }}>
          <Text style={[typography.button1, {color: theme.colors.white}]}>Next</Text>
        </Button>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  textInput: {
    height: 56,
    padding: 12,
  },
  textBorder: {
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 9999,
  }
})

export default Withdraw1;
