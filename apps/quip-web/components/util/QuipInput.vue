<script setup lang="ts">
import {useTheme} from "vuetify";

const props = defineProps<{
  type: string,
  label: string,
}>()

const colors = useTheme().current.value.colors
const text = ref("")
const isMoved = computed(() => text.value.length > 0)
</script>

<template>
  <div class="quipInput rounded-pill position-relative d-flex align-center">
    <div class="px-4 position-absolute no-pointer label"><h3 class="px-2 text-secondary-grey" :class="{'movedLabel': isMoved}">{{label}}</h3></div>
    <input v-model="text" class=" px-6 text-secondary-grey co-headline" :type="type">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.quipInput {
  height: 48px;
  border: 1px solid v-bind("colors['border-grey']");
}

input {
  width: 100%;
  height: 100%;
  outline: none;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.no-pointer {
  pointer-events: none;
}

h3 {
  transition: all 0.2s ease-out;
  font-size: 14px;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: 0.1px;
  color: v-bind("colors['text-secondary-grey']");
  background-color: white;
  border-radius: 9999px;
}

.quipInput:focus-within {
  & > .label > h3 {
    transform: translateY(-24px);
    font-size: 12px;
    line-height: 14px;
  }
}

.movedLabel {
  transform: translateY(-24px);
  font-size: 12px;
  line-height: 14px;
}
</style>
