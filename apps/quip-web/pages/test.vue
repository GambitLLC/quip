<script setup lang="ts">
import Match from "~/components/util/Match.vue";
import QuipInput from "~/components/util/QuipInput.vue";
const a = ref(0)

const {$logout} = useNuxtApp()

function test() {
  $fetch('/api/login', { method: 'post', body: { test: 123 } })
}

async function logout() {
  await $logout()
}
</script>

<template>
  <div class="w-100 h-100 d-flex flex-column align-center justify-center">
<!--    <AvatarCreator/>-->
    <div @click="test()">Click me!</div>
    <div v-ripple @click="logout()">Logout</div>
  </div>
</template>

<style scoped lang="scss">
</style>
