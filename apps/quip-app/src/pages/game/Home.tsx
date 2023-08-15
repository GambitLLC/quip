import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
  AvatarXp,
  Balance,
  capitalize,
  createQuipNavigator,
  LogoText,
  m,
  p,
  Screen,
  Slider,
  spacing,
  Text,
  theme,
  typography,
  useGameStore,
  useNotificationStore
} from "@quip/native-ui";
import {StyleSheet, View} from "react-native";
import {Button} from "react-native-paper";
import {CommonActions, ParamListBase} from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import Wallet from "../wallet/Wallet";
import Settings from "../settings/Settings";
import React from "react";
import {animated, useTransition} from "@react-spring/native"

const Quip = createQuipNavigator();

function GameHome({navigation}: NativeStackScreenProps<ParamListBase, "games">) {
  const {quip} = useGameStore()
  const {add} = useNotificationStore()

  const transitions = useTransition(quip, {
    key: quip.name,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 250 },
    exitBeforeEnter: true,
  })

  return (<Screen screenStyle={[{backgroundColor: theme.colors.background}]} style={[spacing.fill]}>
    <View style={[styles.homeContainer]}>
      {/*Topbar*/}
      <View style={[p('x', 6), m('b', 8)]}>
        {/*Player Topbar*/}
        <View style={[styles.playerBar, m('b', 4)]}>
          <Balance onPress={() => {
            navigation.dispatch({
              ...CommonActions.navigate('wallet')
            })
          }}/>
          <AvatarXp onPress={() => {
            navigation.dispatch({
              ...CommonActions.navigate('profile')
            })
          }} level={5} percentage={.05} source={require('../../../assets/AvatarTest.png')}/>
        </View>
        {/*Select Quip*/}
        <Text style={[typography.h5, {color: theme.colors.s1}]}>
          Select Quip
        </Text>
      </View>
      {/*Slider*/}
      <View style={[m('b', 9)]}>
        <Slider navigation={navigation}/>
      </View>
      {/*Quip Info*/}
      {
        transitions((style, item) => (
          <animated.View style={[p('x', 6), style]}>
            <View style={[{display: "flex", flexDirection: "row"}]}>
              <LogoText fill={item.color} width={66} height={29}/>
              <Text style={[m('l', 1), typography.h5, {color: theme.colors.s1}]}>
                {capitalize(item.name)}
              </Text>
            </View>
            <View style={[m('t', 2)]}>
              <Text style={[typography.t2]}>
                {item.description}
              </Text>
            </View>
          </animated.View>
        ))
      }
      {/*Play Now*/}
      <View style={[{flexGrow: 1}]}/>
      {
        transitions((style, item) => (
          <animated.View style={[p('x', 6), style]}>
            <Button onPress={() => {
              add({
                id: performance.now().toString(),
                type: (() => {
                  //return a random type
                  const types = ["success", "error", "warning", "info"] as const
                  return types[Math.floor(Math.random() * types.length)]
                })(),
                message: "Coming Soon!",
                timeout: 3000,
              })
            }} buttonColor={(item.color as string)} labelStyle={typography.button1} contentStyle={styles.playButton} mode="contained">
              Play Now
            </Button>
          </animated.View>
        ))
      }
      <View style={[{flexGrow: 1}]}/>
      <View/>
    </View>
  </Screen>)
}

export default function Home({navigation}: NativeStackScreenProps<ParamListBase, "gameHome">) {
  return (
    <Quip.Navigator id="quip" initialRouteName={"home"} quipNavBarStyle={{}} contentStyle={{
      height: "100%",
    }}>
      <Quip.Screen name="games" component={GameHome} />
      <Quip.Screen name="wallet" component={Wallet} />
      <Quip.Screen name="settings" component={Settings} />
    </Quip.Navigator>
  )
}

const styles = StyleSheet.create({
  homeContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  playerBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playButton: {
    height: 56,
    borderRadius: 24,
  }
})
