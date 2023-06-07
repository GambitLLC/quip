<script setup lang="ts" generic="T">
import {useTheme} from "vuetify";
import {capitalize} from "~/utils/text";

const props = defineProps<{
  text: T,
  selectedValue: T
}>()

const colors = useTheme().current.value.colors
</script>

<template>
  <h3 :class="text === selectedValue ? 'text-primary' : 'text-jetblack'">{{capitalize(text)}}</h3>
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
