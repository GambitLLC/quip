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
  }
})

const computedWidth = computed(() => {
  return props.width !== undefined? props.width + 'px' : 'auto'
})
</script>

<template>
  <button
    v-ripple
    :style="{
      width: computedWidth
    }"
    class="co-headline font-weight-bold"
  >
    <div>
      <Icon class="icon mr-2" v-if="props.icon !== undefined" :icon="props.icon ?? ''"/>
      <slot />
    </div>
  </button>
</template>

<style scoped>
button {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 70px;
  padding: 12px 24px;
  height: 48px;
  font-size: 18px;
}

button > div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon {
  font-size: 24px;
}
</style>
