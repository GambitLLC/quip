<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {useTheme} from "vuetify";

const colors = useTheme().current.value.colors

const props = defineProps({
  icon: {
    type: String,
    optional: true,
  },
  width: {
    type: Number,
    optional: true,
  },
  color: {
    type: String,
    optional: true
  },
  iconSize: {
    type: Number,
    optional: true,
    default: 24
  },
  prependIcon: {
    type: Boolean,
    optional: true,
    default: true
  }
})

const computedWidth = computed(() => {
  return props.width !== undefined? props.width + 'px' : 'auto'
})

const computedIconSize = computed(() => {
  return props.iconSize !== undefined? props.iconSize + 'px' : '24px'
})
</script>

<template>
  <a
    v-ripple
    :style="{
      width: computedWidth
    }"
    class="co-headline font-weight-bold unselectable"
  >
    <div v-if="prependIcon">
      <Icon class="mr-2 icon" :style="{fontSize: computedIconSize}" v-if="props.icon !== undefined" :icon="props.icon ?? ''"/>
      <slot />
    </div>
    <div v-else>
      <slot />
      <Icon class="ml-2 icon" :style="{fontSize: computedIconSize}" v-if="props.icon !== undefined" :icon="props.icon ?? ''"/>
    </div>
  </a>
</template>

<style scoped>
a {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 70px;
  padding: 12px 24px;
  height: 42px;
}

a > div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
