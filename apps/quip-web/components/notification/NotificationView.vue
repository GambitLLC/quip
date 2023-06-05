<script setup lang="ts">
import { useNotifications } from "~/store/NotificationStore";

const notifications = useNotifications()
</script>

<template>
  <div
    class="w-100 h-100 position-fixed notificationView"
  >
    <div class="d-flex align-end justify-end w-100 h-100 pr-8 pb-4">
      <div class="d-flex flex-column">
        <transition-group name="notification" tag="div">
          <Notification
            class="mb-3"
            v-for="notification in notifications.notifications"
            :key="notification.id"
            :message="notification.message"
            :status="notification.type"
            :dismissable="notification.isDismissable"
            :dismiss-after="notification.timeout"
            @dismiss="() => {
              if (notification.onDismiss) notification?.onDismiss()
              notifications.dismissNotification(notification)
            }"
          />
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notificationView {
  pointer-events: none;
  z-index: 1001;
}
</style>
