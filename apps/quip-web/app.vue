<script setup lang="ts">
import {isMobile} from "~/util/utils";
import {useDisplay} from "vuetify";
const display = useDisplay()
</script>

<template>
  <div
    class="bg-background h-100 w-100 px-md-8"
    :class="{
      'px-lg-16 py-6': !isMobile,
      'mobilePadding': isMobile
    }"
  >
    <Topbar />
  </div>
</template>

<style>
html {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

#__nuxt {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

.mobilePadding {
  padding: 18px 24px;
}
</style>
