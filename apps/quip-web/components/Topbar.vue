<script setup lang="ts">
import {useDisplay} from "vuetify";
import {isMobile} from "~/util/utils";

const display = useDisplay()
</script>

<template>
  <div v-if="!isMobile" class="topbar">
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
      <QuipButton :width="130" class="login text-jetblack">
        Login
      </QuipButton>
    </div>
  </div>
  <div class="mobileTopbar" v-else>
    <img draggable="false" class="mobileLogo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
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
}

button > h3 {
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
