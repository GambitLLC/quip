<script setup lang="ts">
import { NotificationType } from "~/store/NotificationStore";
import { Icon } from "@iconify/vue";

const props = withDefaults(defineProps<{
  message: string,
  status: NotificationType,
  dismissable?: boolean,
  dismissAfter?: number,
}>(), {
  dismissable: true,
  dismissAfter: 5000,
})

const emit = defineEmits<{
  (e: 'dismiss'): void,
}>()

const timer = ref<NodeJS.Timeout | null>(null)
const interval = ref<NodeJS.Timer | null>(null)
const counter = ref(0)

function dismiss() {
  if (timer.value) clearTimeout(timer.value)
  if (interval.value) clearInterval(interval.value)
  emit('dismiss')
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
  <div class="notification text-white elevation-3 pa-3" :class="{
        'bg-success': status === NotificationType.SUCCESS,
        'bg-warning': status === NotificationType.WARNING,
        'bg-error': status === NotificationType.ERROR,
        'bg-info': status === NotificationType.INFO,
        'pb-2': dismissable,
    }">
    <div class="d-flex align-center">
      <Icon :icon="computedIcon" class="notificationIcon mr-2"/>
      <h3 class="message text-white">{{ message }}</h3>
      <v-spacer/>
      <div v-if="dismissable" v-ripple @click="dismiss" class="ml-3 rounded-circle">
        <Icon icon="material-symbols:close-rounded" class="notificationIcon text-white rounded-circle"/>
      </div>
    </div>
    <v-progress-linear :model-value="timerPercentage" class="mt-1 width-transition text-white"/>
  </div>
</template>

<style>
.v-progress-linear__determinate {
  transition: all linear .1s;
}
</style>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.notification {
  pointer-events: all;
  position: relative;
  border-radius: 6px;


  @include md-up {
    max-width: 380px;
  }

  @include sm-down {
    width: 100%;
  }
}

.notificationIcon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
}

.message {
  font-size: 14px;
  font-weight: 500;
}
</style>
