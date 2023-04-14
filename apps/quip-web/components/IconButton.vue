<script setup lang="ts">
import {Icon} from "@iconify/vue";

const props = defineProps({
  icon: {
    type: String,
    optional: true,
  },
  size: {
    type: Number,
    optional: true,
  },
})

const computedSize = computed(() => {
  return props.size !== undefined ? props.size + 'px' : '48px'
})
</script>

<template>
  <a :style="{width: computedSize, height: computedSize}" class="pa-0 rounded-circle" v-ripple>
    <transition name="fade" mode="out-in">
      <Icon :key="props.icon" class="icon" :icon="props.icon ?? ''"/>
    </transition>
  </a>
</template>

<style scoped lang="scss">
@import 'styles/mixins.scss';

a {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

a > * {
  font-size: 24px;
}
</style>
