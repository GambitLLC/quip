<script setup lang="ts">
import {useTheme} from "vuetify";

const props = defineProps<{
  tabs: string[],
  activeTab: number,
}>()

const colors = useTheme().current.value.colors

const emit = defineEmits<{
  (e: 'tab', value: string): void
}>()

const currentTabIndex = ref(props.activeTab)

function switchTab(i: number) {
  currentTabIndex.value = i
  emit('tab', props.tabs[i])
}
</script>

<template>
  <div class="d-flex">
    <h3
      @click="switchTab(i)"
      class="mr-10"
      :class="{'text-primary': i === currentTabIndex, 'text-jetblack': i !== currentTabIndex}"
      v-for="(tab, i) in tabs"
      :key="i"
    >
      {{tab}}
    </h3>
  </div>
</template>

<style scoped lang="scss">
h3 {
  position: relative;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 21px;
  height: 44px;
  transition: color 0.3s ease-in-out, opacity 0.3s ease-in-out;
  cursor: pointer;
  opacity: 0.4;
}

h3.text-primary {
  opacity: 1;
}

h3:after {
  position: absolute;
  content: '';
  width: 100%;
  height: 4px;
  bottom: 0;
  left: 0;
  background-color: v-bind('colors.primary');
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

h3:hover:after {
  transform: translateY(0);
  opacity: 1;
}

h3.text-primary:after {
  background-color: v-bind('colors.primary');
  transform: translateY(0);
  opacity: 1;
}
</style>
