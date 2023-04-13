<script setup lang="ts">
import {Icon} from "@iconify/vue";

const props = defineProps({
  icon: {
    type: String,
    optional: true,
  },
})
</script>

<template>
  <button class="pa-0 rounded-circle" v-ripple>
    <Icon class="icon" :icon="props.icon ?? ''"/>
  </button>
</template>

<style scoped>
button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;
}

button > * {
  font-size: 24px;
}
</style>
