<script setup lang="ts">
import { NotificationType } from "~/store/NotificationStore";
import { Icon } from "@iconify/vue";
import { useElementBounding, useWindowSize } from "@vueuse/core";

const props = withDefaults(defineProps<{
  message: string,
  status: NotificationType,
  dismissable?: boolean,
  dismissAfter?: number,
}>(), {
  dismissable: true,
  dismissAfter: 5000,
})

const notificationRef = ref<HTMLElement | null>(null)
const {width, height} = useWindowSize()
const cachedTop = ref("0px")

const emit = defineEmits<{
  (e: 'dismiss'): void,
}>()

const timer = ref<NodeJS.Timeout | null>(null)
const interval = ref<NodeJS.Timer | null>(null)
const counter = ref(0)

function dismiss() {
  if (timer.value) clearTimeout(timer.value)
  if (interval.value) clearInterval(interval.value)

  if (notificationRef.value) {
    const bottom = notificationRef.value.getBoundingClientRect().bottom
    cachedTop.value = `${height.value - (bottom + 12 + 16)}px`

    console.log(cachedTop.value)
  }

  nextTick(() => {
    emit('dismiss')
  })
}

const computedIcon = computed(() => {
  switch (props.status) {
    case NotificationType.SUCCESS:
      return "material-symbols:check-small-rounded"
    case NotificationType.WARNING:
      return "material-symbols:warning-outline-rounded"
    case NotificationType.ERROR:
      return "material-symbols:error-outline-rounded"
    case NotificationType.INFO:
      return "material-symbols:info-outline-rounded"
    default:
      return "material-symbols:info-outline-rounded"
  }
})

onMounted(() => {
  if (props.dismissAfter) {
    timer.value = setTimeout(() => {
      dismiss()
    }, props.dismissAfter)

    interval.value = setInterval(() => {
      counter.value += 100
    }, 100)
  }
})

onUnmounted(() => {
  if (timer.value) clearTimeout(timer.value)
  if (interval.value) clearInterval(interval.value)
})

const timerPercentage = computed(() => {
  return 100-(counter.value/props.dismissAfter)*100
})
</script>

<template>
  <div ref="notificationRef" class="mb-3 d-flex justify-end notif">
    <div class="notification text-white elevation-3 pa-3" :class="{
        'bg-success': status === NotificationType.SUCCESS,
        'bg-warning': status === NotificationType.WARNING,
        'bg-error': status === NotificationType.ERROR,
        'bg-info': status === NotificationType.INFO,
        'pb-2': dismissable,
    }">
      <div class="notificationRow">
        <Icon :icon="computedIcon" class="notificationIcon mr-2"/>
        <h3 class="message text-white">{{ message }}</h3>
        <div v-if="dismissable" v-ripple @click="dismiss" class="ml-2 rounded-circle">
          <Icon icon="material-symbols:close-rounded" class="notificationIcon paddingIcon text-white rounded-circle"/>
        </div>
      </div>
      <v-progress-linear :model-value="timerPercentage" class="mt-1 width-transition text-white"/>
    </div>
  </div>
</template>

<style>
.v-progress-linear__determinate {
  transition: all linear .1s;
}
</style>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.notif {
  bottom: v-bind(cachedTop) !important;
  right: 0 !important;
}

.notification {
  pointer-events: all;
  position: relative;
  border-radius: 6px;
}

.notificationRow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.notificationIcon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.paddingIcon {
  padding: 2px;
}

.message {
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
}
</style>
