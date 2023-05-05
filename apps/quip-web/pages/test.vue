<script setup lang="ts">
import Match from "~/components/util/Match.vue";
const a = ref(0)
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column align-center justify-center">
<!--    <AvatarCreator/>-->
    <div @click="a = (a + 1) % 3">
      Click me! {{a}}
    </div>
    <Match :match="a">
      <div :case="0">
        Case 0
      </div>
      <div :case="1">
        Case 1
      </div>
      <div>
        Case default
      </div>
    </Match>
  </div>
</template>

<style scoped lang="scss">
</style>
