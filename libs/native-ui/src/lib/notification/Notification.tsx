import { View, StyleSheet } from "react-native"
import {m, p} from "../styles/Spacing";
import {Text} from "../text/Text";
import {theme} from "../../theme";
import {TouchableRipple} from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import LinearProgress from "../progress/LinearProgress";
import React, {useMemo} from "react";
import {INotification, useNotificationStore} from "../store/NotificationStore";
import {easings, animated} from '@react-spring/native'

interface NotificationProps {
  notification: INotification,
  style?: any,
}

export default function Notification(props: NotificationProps) {
  const {notification} = props
  const {remove} = useNotificationStore()

  return (
    <animated.View
      pointerEvents="auto"
      style={[
        props.style,
        styles.notification,
        p('a', 4),
        m('y', 1),
        {
          backgroundColor: ((() => {
            switch (notification.type) {
              case "error":
                return theme.colors.error
              case "success":
                return theme.colors.success
              case "info":
                return theme.colors.info
              case "warning":
                return theme.colors.warning
              default:
                return theme.colors.info
            }
          })()),
        },
      ]}>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText]}>{notification.message}</Text>
        <TouchableRipple borderless style={[styles.closeBtn]} onPress={() => {
          remove(notification)
        }}>
          <View>
            <FontAwesome name={"times"} size={16} color={theme.colors.white} />
          </View>
        </TouchableRipple>
      </View>
      <LinearProgress
        percentage={100}
        height={4}
        color={theme.colors.white}
        backgroundColor={"rgba(255, 255, 255, 0.2)"}
        borderRadius={2}
        spring={{
          from: {width: "100%"},
          to: {width: "0%"},
          onRest: () => {
            remove(notification)
          },
          config: {
            duration: notification.timeout ?? 3000,
            easing: easings.linear,
          }
        }}
      />
    </animated.View>
  )
}

const styles = StyleSheet.create({
  notification: {
    overflow: "hidden",
    borderRadius: 16,
    shadowColor: "#1D1D1D",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
  },

  notificationContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  notificationText: {
    color: theme.colors.white,
    fontSize: 14,
    flexShrink: 1,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
})
