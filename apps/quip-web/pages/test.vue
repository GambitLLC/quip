<script setup lang="ts">
const logout = useLogout()

function test() {
  $fetch('/api/login', { method: 'post', body: { test: 123 } })
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
