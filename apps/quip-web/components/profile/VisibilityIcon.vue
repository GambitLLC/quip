<script setup lang="ts">
import {Icon} from "@iconify/vue";

const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <div @click="emits('update:modelValue', !modelValue)" v-ripple class="visibilityIcon text-primary mr-2">
    <Icon :icon="modelValue? 'material-symbols:visibility-outline' : 'material-symbols:visibility-off-outline'"/>
  </div>
</template>

<style scoped lang="scss">
.visibilityIcon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
</style>
