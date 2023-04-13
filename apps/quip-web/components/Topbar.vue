<script setup lang="ts">
</script>

<template>
  <div class="topbar">
    <img class="logo" src="/logo.svg" alt="Quip Logo" />
    <div class="buttons">
      <button>Home</button>
      <button>About</button>
      <button>Games</button>
      <button class="mr-3">FAQ</button>
      <QuipButton icon="material-symbols:download-rounded" class="bg-primary mr-3">
        Download App
      </QuipButton>
      <QuipButton :width="129" class="login text-jetblack">
        Login
      </QuipButton>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
}

.logo {
  height: 44px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 13px 20px;
  font-family: 'co-headline';
  font-weight: normal;
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.login {
  border: solid 2px;
}
</style>
