<script setup lang="ts">
import {isMobile} from "~/util/utils";
</script>

<template>
  <div
    class="bg-background h-100 w-100"
    :class="{
      'px-16 py-6': !isMobile,
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
