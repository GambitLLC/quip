<script setup lang="ts">
import {useDisplay} from "vuetify";

const {mobile} = useDisplay()
</script>

<template>
  <div v-if="!mobile" class="topbar">
    <img draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
    <div class="buttons">
      <button class="hover-underline-animation co-headline">
        Home
      </button>
      <button class="hover-underline-animation co-headline">
        About
      </button>
      <button class="hover-underline-animation co-headline">
        Games
      </button>
      <button class="mr-3 hover-underline-animation co-headline">
        FAQ
      </button>
      <QuipButton icon="material-symbols:download-rounded" class="bg-primary mr-3">
        Download App
      </QuipButton>
      <QuipButton :width="130" class="login text-jetblack">
        Login
      </QuipButton>
    </div>
  </div>
  <div v-else class="mobileTopbar">
    <img draggable="false" class="mobileLogo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
    <div class="buttons">
      <IconButton icon="ic:outline-file-download" class="bg-primary mr-2" />
      <IconButton icon="material-symbols:menu" class="login text-jetblack"/>
    </div>
  </div>
</template>

<style scoped>
/*desktop topbar*/
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
  font-size: 18px;
  font-weight: normal;
  line-height: 22px;
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.login {
  border: solid 2px;
}

/*mobile topbar*/
.mobileTopbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
}

.mobileLogo {
  height: 48px;
}
</style>
