<script setup lang="ts">
import {Accessory, Eye, Face, Hair, Mouth, Outfit} from "~/components/util/Avatar/types";

const props = defineProps<{
  size: number,
  color: string,
  accessory?: Accessory
  eye: Eye,
  face: Face,
  hair?: Hair,
  mouth: Mouth,
  outfit: Outfit
}>()

const computedSize = computed(() => `${props.size}px`)
const computedAccessory = computed(() => `/playful_avatars/accessories/${props.accessory}.svg`)
const computedEye = computed(() => `/playful_avatars/eyes/${props.eye}.svg`)
const computedFace = computed(() => `/playful_avatars/face/${props.face}.svg`)
const computedHair = computed(() => `/playful_avatars/hair/${props.hair}.svg`)
const computedMouth = computed(() => `/playful_avatars/mouth/${props.mouth}.svg`)
const computedOutfit = computed(() => `/playful_avatars/outfit/${props.outfit}.svg`)
</script>

<template>
  <div :class="color" class="position-relative rounded-circle d-flex align-center justify-center overflow-hidden" :style="{width: computedSize, height: computedSize}">
    <img v-if="props.accessory !== undefined" class="accessory" :src="computedAccessory" alt="accessory">
    <img  class="eye" :src="computedEye" alt="eye">
    <img class="face" :src="computedFace" alt="face">
    <img v-if="props.hair !== undefined" class="hair" :src="computedHair" alt="hair">
    <img class="mouth" :src="computedMouth" alt="mouth">
    <img class="outfit" :src="computedOutfit" alt="outfit">
  </div>
</template>

<style scoped lang="scss">
img {
  position: absolute;
}

.accessory {
  position: absolute;
  z-index: 3;
  //top: 50px;
  top: 16.949%;
  //left: 72px;
  left: 24.407%;
}

.eye {
  position: absolute;
  z-index: 2;
  //top: 120px;
  top: 40.678%;
  //left: 145px;
  left: 49.153%;
}

.face {
  position: relative;
  top: 13.559%;
  left: -3.4%;
}

.hair {
  position: absolute;
  margin-top: -5px;
}

.mouth {
  position: absolute;
  bottom: 30.508%;
  left: 52.542%;
}

.outfit {
  position: absolute;
  z-index: 1;
  top: 190px;
  left: 8px;
}
</style>
