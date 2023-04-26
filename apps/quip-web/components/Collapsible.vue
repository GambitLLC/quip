<script setup lang="ts">
import {computed, ref} from "vue";
import {useElementSize} from "@vueuse/core";
import {onMounted, watch} from "@vue/runtime-core";
import {Icon} from "@iconify/vue";
const emits = defineEmits({open: null})
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  hasDivider: {
    type: Boolean,
    default: true,
  },
  ignoreClick: {
    type: Boolean,
    default: false
  }
})
const isOpen = ref(props.open ?? false)
const headerRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const headerSize = useElementSize(headerRef)
const bodySize = useElementSize(bodyRef)
const maxHeight = computed(() => {
  const value = isOpen.value ? `${headerSize.height.value+bodySize.height.value}px` : `${headerSize.height.value}px`
  if (value === "0px") {
    return isOpen.value
      ? `100%`
      : `${headerRef.value?.getBoundingClientRect().height}px`
  }
  return value
})
function open() {
  if (!props.ignoreClick) {
    isOpen.value = !isOpen.value
    emits("open", isOpen.value)
  }
}
watch(() => props.open, (newValue) => {
  isOpen.value = newValue
})
</script>

<template>
  <div class="collapsible">
    <div ref="headerRef" @click="open" class="roundedCorners unselectable">
      <div class="d-flex flex-row align-center pb-2 pb-md-6 pb-lg-6 pb-xl-6 pb-xxl-6 header">
        <slot name="header"></slot>
        <div class="flex-grow-1">

        </div>
        <Icon :class="{'collapseIconClosed': !isOpen}" class="collapseIcon" icon="material-symbols:keyboard-arrow-down"/>
      </div>
    </div>
    <div ref="bodyRef" class="roundedCorners">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.header {
  cursor: pointer;
}

.divider {
  position: absolute;
  bottom: 0;
  width: 100%;
}

.collapsible {
  position: relative;
  transition: max-height 0.35s ease;
  height: 100%;
  overflow: hidden;
  max-height: v-bind(maxHeight);
}

.roundedCorners {
  border-radius: inherit;
}

.collapseIcon {
  font-size: 48px;
  transition: transform 0.35s ease;

  @include sm-down {
    font-size: 32px;
  }
}

.collapseIconClosed {
  transform: rotate(180deg);
  transform-origin: center;
}
</style>
