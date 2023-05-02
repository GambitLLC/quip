<script setup lang="ts">
import {Icon} from "@iconify/vue";

const emit = defineEmits<{
  (e: 'left'): void,
  (e: 'right'): void
}>()

function left() { emit('left') }
function right() { emit('right') }
</script>

<template>
  <div class="d-flex align-center slider">
    <div class="sliderIcon" @click="left">
      <Icon icon="material-symbols:chevron-left-rounded" />
    </div>
    <div class="flex-grow-1">
      <slot/>
    </div>
    <div class="sliderIcon" @click="right">
      <Icon icon="material-symbols:chevron-right-rounded" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.slider {
  width: 280px;
}

.sliderIcon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
}
</style>
