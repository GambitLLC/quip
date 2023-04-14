<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";
import {useWindowScroll} from "@vueuse/core";

const {mobile} = useDisplay()
const {colors} = useTheme().current.value

const isOpen = ref(false)
const { x, y } = useWindowScroll()

const toggleMobileMenu = () => {
  isOpen.value = !isOpen.value
}

const isScrolled = computed(() => {
  return y.value > 0 || window.scrollY > 0
})

onMounted(() => {
  console.log(colors)
})
</script>

<template>
  <div class="topbarBase" :class="{'topbarBaseScrolled': isScrolled}">
    <div v-if="!mobile" class="topbar">
      <img draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
      <div class="buttons">
        <a class="hover-underline-animation">
          <h3>
            Home
          </h3>
        </a>
        <a class="hover-underline-animation">
          <h3>
            About
          </h3>
        </a>
        <a class="hover-underline-animation">
          <h3>
            Games
          </h3>
        </a>
        <a class="mr-3 hover-underline-animation">
          <h3>
            FAQ
          </h3>
        </a>
        <QuipButton href="https://www.apple.com/app-store/" target="_blank" icon="material-symbols:download-rounded" class="bg-primary mr-3">
          <h3 class="font-weight-bold">
            Download App
          </h3>
        </QuipButton>
        <QuipButton :width="130" class="login text-jetblack">
          <h3 class="font-weight-bold">
            Login
          </h3>
        </QuipButton>
      </div>
    </div>
    <div v-else class="topbar">
      <img draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
      <div class="buttons">
        <IconButton href="https://www.apple.com/app-store/" target="_blank" icon="ic:outline-file-download" class="bg-primary mr-2" />
        <IconButton @click="toggleMobileMenu" :icon="isOpen? 'material-symbols:close-rounded' : 'material-symbols:menu'" class="login text-jetblack"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$transitionTime: 0.3s;

@import 'styles/mixins.scss';

.topbarBase {
  padding: 24px 64px;

  @include md-down {
    padding: 24px 32px;
  }

  @include sm-down {
    padding: 18px 24px;
  }

  position: sticky;
  top: 0;
  z-index: 100;
  background: v-bind('colors.background');
  transition: background $transitionTime ease-in-out, border-bottom-color $transitionTime ease-in-out;
  border-bottom: solid 1px transparent;
}

.topbarBaseScrolled {
  background: v-bind('colors["grey-light"]');
  border-bottom-color: v-bind('colors["border-grey"]');
}

.topbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;

  @include md-down {
    height: 40px;
  }

  @include sm-down {
    height: 40px;
  }
}

.logo {
  height: 100%;
  transition: filter $transitionTime ease-in-out;
}

a {
  background: none;
  border: none;
  cursor: pointer;
  padding: 13px 20px;
}

h3 {
  font-weight: normal;
  font-size: 18px;
  line-height: 22px;

  @include md-down {
    font-size: 16px;
    line-height: 20px;
  }
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
