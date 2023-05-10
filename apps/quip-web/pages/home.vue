<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";
import View from "~/components/util/View.vue";

const {mobile} = useDisplay()
const {colors} = useTheme().current.value
</script>

<template>
  <div>
    Home
  </div>
</template>

<style scoped lang="scss">
</style>
