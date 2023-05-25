<script setup lang="ts">
import {useTheme} from "vuetify";
import {useElementSize} from "@vueuse/core";

const props = defineProps<{
  hasBorder?: boolean,
}>()

const colors = useTheme().current.value.colors

const cardRef = ref<HTMLElement | null>(null)
const {width, height} = useElementSize(cardRef)

const computedWidth = computed(() => `${width.value}px`)
const computedHeight = computed(() => `${height.value}px`)
</script>

<template>
  <div class="animateCard" :class="{'quipBorder': hasBorder}">
    <div ref="cardRef" class="card">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 56px;
  position: relative;
}

.quipBorder {
  border: 1px solid v-bind(colors["border-grey"]);
}

.animateCard {
  transition: all 0.2s ease-in-out;
  width: v-bind(computedWidth);
  height: v-bind(computedHeight);
  overflow: hidden;
  position: relative;
}
</style>
