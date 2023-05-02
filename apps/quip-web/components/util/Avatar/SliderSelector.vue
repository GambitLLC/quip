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
    <a v-ripple class="sliderIcon rounded-circle" @click="left">
      <Icon icon="material-symbols:chevron-left-rounded" />
    </a>
    <div class="flex-grow-1">
      <slot/>
    </div>
    <a v-ripple class="sliderIcon rounded-circle pl-1" @click="right">
      <Icon icon="material-symbols:chevron-right-rounded" />
    </a>
  </div>
</template>

<style scoped lang="scss">
@import "styles/mixins.scss";

.slider {
  width: 280px;

  @include sm-down {
    width: 220px;
  }
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
