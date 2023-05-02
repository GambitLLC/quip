<script setup lang="ts">
import Topbar from "~/components/util/Topbar/Topbar.vue";
</script>

<template>
  <div class="h-100 w-100 d-flex flex-column">
    <ClientOnly>
      <Topbar/>
    </ClientOnly>
    <div class="d-flex w-100 h-100 safeArea mt-2">
      <div class="w-100 h-100">
        <slot/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
