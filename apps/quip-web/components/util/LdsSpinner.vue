<script setup lang="ts">
import {useTheme} from "vuetify";

const props = defineProps<{
  size?: string,
}>()

const colors = useTheme().current.value.colors

const computedSize = computed(() => props.size ?? '80px')
</script>

<template>
  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
</template>

<style scoped lang="scss">
.lds-ring {
  display: inline-block;
  position: relative;
  width: v-bind(computedSize);
  height: v-bind(computedSize);
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid v-bind("colors.primary");
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: v-bind("colors.primary") transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
