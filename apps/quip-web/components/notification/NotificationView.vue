<script setup lang="ts">
import { useNotifications } from "~/store/NotificationStore";
import { useDisplay } from "vuetify";
import { useElementSize } from "@vueuse/core";

const notifications = useNotifications()
const { mobile } = useDisplay()

const notificationRef = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(notificationRef)

const notificationEntryRef = ref<HTMLElement | null>(null)
function addNotificationRef(el: HTMLElement | null) {
  if (el) {
    console.log(el)
    notificationEntryRef.value = el
  }
}

const cachedWidth = ref(`${width}px`)
const cachedHeight = ref(`${height}px`)

watch(width, (newWidth) => {
  if (newWidth !== 0) {
    cachedWidth.value = `${newWidth}px`
  }
})

watch(notificationEntryRef, (newNotification) => {
  if (newNotification) {
    console.log(newNotification)
    cachedHeight.value = `${newNotification.clientHeight + 12}px`
  }
})
</script>

<template>
  <div
    class="w-100 h-100 position-fixed notificationView"
  >
    <div class="d-flex align-end justify-end w-100 h-100 pr-8 pb-4">
      <div ref="notificationRef" class="d-flex flex-column position-relative notifications">
        <transition-group name="notification" tag="div">
          <div
            v-for="notification in notifications.notifications"
            :ref="addNotificationRef"
            :key="notification.id"
          >
            <Notification
              class="mb-3"
              :message="notification.message"
              :status="notification.type"
              :dismissable="notification.isDismissable"
              :dismiss-after="notification.timeout"
              @dismiss="() => {
                if (notification.onDismiss) notification?.onDismiss()
                notifications.dismissNotification(notification)
              }"
            />
          </div>
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

.notifications {
  min-width: v-bind(cachedWidth);
  min-height: v-bind(cachedHeight);
}
</style>
