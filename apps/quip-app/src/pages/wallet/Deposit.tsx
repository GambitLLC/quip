import {View, StyleSheet, Share, Alert, Pressable} from "react-native";
import {
  p,
  Screen,
  spacing,
  theme,
  Text,
  m,
  border,
  shortAddress,
  flex,
  typography,
  useNotificationStore
} from "@quip/native-ui";

import QRCodeStyled from 'react-native-qrcode-styled';
import {Button, IconButton, TouchableRipple} from "react-native-paper";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from "@react-navigation/native";
import {useSpring, useTransition, animated} from "@react-spring/native";
import { useState } from "react"

const AnimatedText = animated(Text)
const AnimatedIcon = animated(MaterialIcons)

interface DepositProps {

}

export function Deposit(props: DepositProps) {
  const navigation = useNavigation()
  const address = "HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j";
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address);
  };

  if (showCopySuccess) {
    setTimeout(() => {
      setShowCopySuccess(false)
    }, 1000)
  }

  const transitions = useTransition(showCopySuccess, {
    from: {
      opacity: 0
    },
    enter: {
      opacity: 1
    },
    leave: {
      opacity: 0
    },
    exitBeforeEnter: true,
    config: {
      duration: 200
    }
  })

  const [hoverStyle, api] = useSpring(() => ({
    opacity: isHovering ? 0.4 : 1.0
  }), [isHovering])

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: address
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <Screen style={[spacing.fill]}>
      <View style={[styles.deposit, p('x', 6), p('b', 14)]}>
        <View style={p('x', 4)}>
          <View style={[styles.depositHeader, flex.row, flex.alignCenter, flex.spaceBetween, p('a', 4), m('b', 10)]}>
            <IconButton onPress={() => {
              navigation.goBack()
            }} icon={"arrow-left"}/>
            <Text style={typography.h6}>
              Scan QR Code
            </Text>
            <IconButton icon={""}/>
          </View>
          <View style={[flex.col, flex.alignCenter]}>
            <View style={[m('b', 4)]}>
              <QRCodeStyled
                data={'HJ7MqeXQL1MLfVEh4qZeUzExKg8RUS9Pxiu98oXruG6j'}
                style={{backgroundColor: 'white'}}
                color={theme.colors.p1}
                padding={0}
                isPiecesGlued={true}
                pieceBorderRadius={2}
                pieceSize={6}
              />
            </View>
            <View
              style={[
                border.quip,
                styles.address,
                p('x', 6),
                p('y', 2),
              ]}
            >
              <Text style={styles.addressText}>
                {shortAddress(address, 8)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={{width: 288}}>
          <Text style={[styles.warningTextBold]}>WARNING!</Text>
          <Text style={[styles.warningText]}> Send only Solana (SOL) to this address. Sending any other coin will result in permanent loss.</Text>
        </Text>
        <View>
          <Pressable
            onPressIn={() => {
              console.log("in")
              setIsHovering(true)
            }}


            onPressOut={() => {
              console.log("out")
              setIsHovering(false)
            }}

            onPress={() => {
              if (!showCopySuccess) setShowCopySuccess(true)
            }}

            style={[{height: 56}, m('b', 4), flex.row, flex.center, flex.shrink]}>
            {transitions((tStyle, doShow) =>
              <animated.View style={tStyle}>
                {
                  doShow ?
                    <View style={[flex.row, flex.center]}>
                      <Text style={[typography.button1, {color: theme.colors.p2}]}>
                        Address copied
                      </Text>
                      <MaterialIcons name="check" size={24} color={theme.colors.p2} style={[m('l', 2), m('b', 1)]}/>
                    </View>
                    :
                    <View style={[flex.row, flex.center]}>
                      <AnimatedIcon name="content-copy" size={24} color={theme.colors.p1} style={[m('r', 2), m('b', 1), hoverStyle]}/>
                      <AnimatedText style={[typography.button1, {color: theme.colors.p1}, hoverStyle]}>
                        Copy to clipboard
                      </AnimatedText>
                    </View>
                }
              </animated.View>
            )}
          </Pressable>
          <Button onPress={onShare} mode={"contained"} style={{width: 300}} contentStyle={{height: 56}}>
            <Text style={[typography.button1, {color: theme.colors.white}]}>
              Share Address
            </Text>
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  deposit: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%"
  },

  depositHeader: {
    backgroundColor: theme.colors.s5,
    borderRadius: 16,
    width: "100%"
  },

  subtext: {
    color: theme.colors.s4,
    fontSize: 14,
  },

  address: {
    borderRadius: 24,
  },

  addressText: {
    color: theme.colors.s4,
    fontSize: 14,
    flexShrink: 1
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
});

export default Deposit;
