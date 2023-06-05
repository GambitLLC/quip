<script setup lang="ts">
import { useNotifications, Notification, NotificationType } from "~/store/NotificationStore";


const notifications = useNotifications()

function testNotification() {
  const length = 50
  //set the length to be a random number from 1 to 50
  const randomLength = Math.floor(Math.random() * length) + 1

  const randomMessage = Array(randomLength).fill(0).map(() => Math.random().toString(36)[2]).join('')

  notifications.addNotification(new Notification(NotificationType.SUCCESS, randomMessage));
}
</script>

<template>
  <div>
    <div @click="testNotification" v-ripple>Click me!</div>
  </div>
</template>

<style scoped lang="scss">
</style>
