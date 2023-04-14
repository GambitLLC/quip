<script setup lang="ts">
import {useTheme} from "vuetify";

const props = defineProps<{
  title: string,
  text: string,
  titleMargin: string,
  textMaxWidth: number,
  circle: {
    size: number,
    top?: number,
    left?: number,
    right?: number,
    bottom?: number,
  }
  img: {
    src: string,
    alt: string,
    top?: number,
    left?: number,
    right?: number,
    bottom?: number,
    overflow: boolean,
  }
  color: "green" | "purple" | "blue",
  textLocation: "top" | "bottom",
}>()

const computedColor = computed(() => `bg-${props.color}-light`)
const computedCicleColor = computed(() => `bg-${props.color}-dark`)
const computedCircleStyle = computed(() => {
  return {
    width: props.circle.size + 'px',
    height: props.circle.size + 'px',
    top: props.circle.top !== undefined? props.circle.top + 'px' : undefined,
    left: props.circle.left !== undefined? props.circle.left + 'px' : undefined,
    right: props.circle.right !== undefined? props.circle.right + 'px' : undefined,
    bottom: props.circle.bottom !== undefined? props.circle.bottom + 'px' : undefined,
  }
})
const computedImgStyle = computed(() => {
  return {
    top: props.img.top !== undefined? props.img.top + 'px' : undefined,
    left: props.img.left !== undefined? props.img.left + 'px' : undefined,
    right: props.img.right !== undefined? props.img.right + 'px' : undefined,
    bottom: props.img.bottom !== undefined? props.img.bottom + 'px' : undefined,
  }
})
const computedTextMaxWidth = computed(() => {
  return props.textMaxWidth + 'px'
})
const isTiny = computed(() => props.color === "purple" || props.color === "blue")

</script>

<template>
  <QuipCard :class="computedColor + (!img.overflow? ' overflow-hidden' : '')" class="w-100 h-100">
    <div class="position-absolute w-100 h-100 innerContent">
      <div class="h-100 d-flex flex-column" :class="{'pa-12': isTiny, 'pa-16': !isTiny}">
        <div v-if="textLocation === 'bottom'" class="flex-grow-1"></div>
        <h3 :class="titleMargin">
          {{ title }}
        </h3>
        <p :class="isTiny? 'tiny' : ''" :style="{maxWidth: computedTextMaxWidth}">
          {{ text }}
        </p>
      </div>
    </div>
    <div class="position-absolute w-100 h-100 overflow-hidden">
      <div :style="computedCircleStyle" :class="computedCicleColor" class="circle">
      </div>
    </div>
    <div :style="computedCircleStyle" class="circle">
      <img class="position-absolute appImage" :src="props.img.src" :alt="props.img.alt" :style="computedImgStyle">
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
.innerContent {
  z-index: 10;
}

.circle {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
}

h3 {
  line-height: 56px;
  font-size: 48px;
  font-weight: bold;
}

p {
  line-height: 24px;
  font-size: 24px;
  font-weight: 300;
}

p.tiny {
  font-size: 18px;
  line-height: 22px;
}

.appImage {
  z-index: 10;
}
</style>
