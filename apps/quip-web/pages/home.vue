<script setup lang="ts">
import Topbar from "~/components/util/Topbar.vue";
import {useDisplay, useTheme} from "vuetify";

const {mobile} = useDisplay()
const {colors} = useTheme().current.value
</script>

<template>
  <div class="w-100 h-100">
    <Topbar/>
  </div>
</template>

<style scoped lang="scss">
</style>
