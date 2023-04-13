<script setup lang="ts">
</script>

<template>
  <div class="topbar">
    <img draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
    <div class="buttons">
      <button class="hover-underline-animation">
        <h3>
          Home
        </h3>
      </button>
      <button class="hover-underline-animation">
        <h3>
          About
        </h3>
      </button>
      <button class="hover-underline-animation">
        <h3>
          Games
        </h3>
      </button>
      <button class="mr-3 hover-underline-animation">
        <h3>
          FAQ
        </h3>
      </button>
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
}

button > h3 {
  font-size: 18px;
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
