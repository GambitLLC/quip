<script setup lang="ts">
import { useNotifications } from "~/store/NotificationStore";
import { useDisplay } from "vuetify";

const notifications = useNotifications()
const { mobile } = useDisplay()
</script>

<template>
  <div
    class="w-100 h-100 position-fixed notificationView"
  >
    <div class="d-flex align-end justify-end w-100 h-100 pr-8 pb-4">
      <div class="notifWrapper">
        <transition-group name="notification">
            <Notification
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

.notifWrapper {
  width: 320px;
  max-width: 320px;
  min-height: 64px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tGroup {
  position: relative;
  width: 320px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}
</style>
