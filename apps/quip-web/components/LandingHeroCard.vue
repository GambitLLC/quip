<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";

const {mobile} = useDisplay()
const props = defineProps<{
  title: string,
  text: string,
  titleMargin: string,
  textMaxWidth: number,
  circle: {
    size: number,
    top?: string,
    left?: string,
    right?: string,
    bottom?: string,
  }
  img: {
    src: string,
    width?: string,
    height?: string,
    alt: string,
    top?: string,
    left?: string,
    right?: string,
    bottom?: string,
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
    top: props.circle.top,
    left: props.circle.left,
    right: props.circle.right,
    bottom: props.circle.bottom,
  }
})
const computedImgStyle = computed(() => {
  return {
    width: props.img.width,
    height: props.img.height,
    top: props.img.top,
    left: props.img.left,
    right: props.img.right,
    bottom: props.img.bottom,
  }
})
const computedTextMaxWidth = computed(() => {
  return props.textMaxWidth + 'px'
})
const isTiny = computed(() => (props.color === "purple" || props.color === "blue") && !mobile.value)

</script>

<template>
  <QuipCard :class="computedColor + (!img.overflow? ' overflow-hidden' : '')" class="w-100 h-100">
    <div class="position-absolute w-100 h-100 innerContent">
      <div class="h-100 d-flex flex-column cardPaddingMobile" :class="{'pa-12': isTiny, 'pa-16': !isTiny}">
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
@import "styles/mixins.scss";

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

  @include lg-down {
    font-size: 28px;
    line-height: 30px;
  }

  @include sm-down {
    font-size: 32px;
    line-height: 37px;
  }
}

p {
  line-height: 24px;
  font-size: 24px;
  font-weight: 300;

  @include sm-down {
    font-size: 18px;
    line-height: 22px;
  }
}

p.tiny {
  font-size: 18px;
  line-height: 22px;
}

.appImage {
  z-index: 10;
}

.cardPaddingMobile {
  @include sm-down {
    padding: 40px 32px !important;
  }
}
</style>
