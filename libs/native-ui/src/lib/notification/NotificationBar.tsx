import {StyleSheet, View} from 'react-native'
import {Screen} from "../screen/Screen";
import {useNotificationStore} from "../store/NotificationStore";
import {p} from "../styles/Spacing";
import React from "react";
import Notification from "./Notification";
import {easings, useTransition} from "@react-spring/native";

interface NotificationBarProps {
  children: React.ReactNode,
}

export default function NotificationBar(props: NotificationBarProps) {
  const {notifications, remove} = useNotificationStore()

  let height = 0
  const transitions = useTransition(notifications, {
    keys: (item: any) => item.id,
    from: {opacity: 0, height: 0},
    enter: {opacity: 1, height: 72},
    leave: {opacity: 0, height: 0},
    config: {duration: 400, easing: easings.easeInOutCubic
    },
  })

  return (
    <>
      {props.children}
      <View pointerEvents="box-none" style={styles.notificationBar}>
        <Screen pointerEvents="box-none" hasSafeArea={false} backgroundColor={"transparent"}>
          <View pointerEvents="box-none" style={[p('x', 8), p('t', 14)]}>
            <View style={{position: "relative"}}>
              {
                transitions((style, notification) => (
                  <Notification
                    key={notification.id}
                    notification={notification}
                    style={style}
                  />
                ))
              }
            </View>
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
    top: 0,
    zIndex: 1000,
  },
})

export {
  NotificationBar
}
