import {StyleSheet, View} from 'react-native'
import {Text} from '../text/Text'
import {Screen} from "../screen/Screen";
import {useNotificationStore} from "../store/NotificationStore";
import {m, p} from "../styles/Spacing";
import {border} from "../styles/Border";
import {theme} from "../../theme";
import {IconButton, TouchableRipple} from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface NotificationBarProps {
  children: React.ReactNode,
}



export default function NotificationBar(props: NotificationBarProps) {
  const {notifications, remove} = useNotificationStore()

  return (
    <>
      {props.children}
      <View pointerEvents="box-none" style={styles.notificationBar}>
        <Screen hasSafeArea={false} backgroundColor={"transparent"}>
          <View style={[p('x', 8), p('b', 8)]}>
            {notifications.reverse().map((notification, index) => (
              <View
                key={index}
                style={[
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
                <Text style={[styles.notificationText]}>{notification.message}</Text>
                <TouchableRipple borderless style={[styles.closeBtn]} onPress={() => {
                  remove(notification)
                }}>
                  <View pointerEvents="box-only">
                    <FontAwesome name={"times"} size={16} color={theme.colors.white} />
                  </View>
                </TouchableRipple>
              </View>
            ))}
          </View>
        </Screen>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  notificationBar: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    zIndex: 1000,
  },

  notification: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    shadowColor: "#1D1D1D",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
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

export {
  NotificationBar
}
