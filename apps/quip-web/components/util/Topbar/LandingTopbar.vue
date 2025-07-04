<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";
import QuipButton from "~/components/util/QuipButton.vue"
import IconButton from "~/components/util/IconButton.vue"
import {useScroll} from "~/utils/scroll";
import { Tab } from "~/utils/types";
import { capitalize } from "~/utils/text";
import { vOnClickOutside } from '@vueuse/components'
import {useModal} from "~/store/ModalStore";
import { Icon } from "@iconify/vue";
import { useEventListener } from "@vueuse/core";

const props = defineProps<{
  tabSections: [Tab, HTMLElement | null][]
}>()

const modal = useModal()
const {mobile} = useDisplay()
const {colors} = useTheme().current.value

const isOpen = ref(false)
const { isScrolled } = useScroll()

const toggleMobileMenu = () => {
  isOpen.value = !isOpen.value
}

const emit = defineEmits<{
  (e: 'tab', value: Tab): void
}>()

function changeTab(tab: Tab) {
  isOpen.value = false
  emit('tab', tab)
}

const tabs: Tab[] = ['home', 'about', 'games', 'faq']
const tabIcons = {
  home: 'material-symbols:home-outline-rounded',
  about: 'material-symbols:info-outline-rounded',
  games: 'material-symbols:videogame-asset-outline-rounded',
  faq: 'material-symbols:help-outline-rounded',
}

useEventListener('scroll', (e) => {
  if (isOpen.value) isOpen.value = false
})

const {y} = useScroll()

const intersectedTab = computed(() => {
  for (let tabProp of props.tabSections) {
    const elem = tabProp[1]
    if (!elem) continue

    if (y.value + 77 >= elem.offsetTop && (y.value + 77 <= elem.offsetTop + elem.offsetHeight)) {
      return tabProp[0]
    }
  }

  //if we are here we weren't exactly on a tab, lets fine the closest one
  let closest = props.tabSections[0][0]
  let closestDist = Infinity

  for (let tabProp of props.tabSections) {
    const elem = tabProp[1]
    if (!elem) continue

    const dist = Math.abs(y.value + 77 - elem.offsetTop)
    if (dist < closestDist) {
      closest = tabProp[0]
      closestDist = dist
    }
  }

  return closest
})

function openLoginModal() {
  isOpen.value = false
  modal.open('Login')
}

function goHome() {
  changeTab('home')
}
</script>

<template>
  <div class="topbarHeight">
    <div v-on-click-outside="() => isOpen = false" class="topbarBase safeArea" :class="{'topbarBaseScrolled': isScrolled || isOpen}">
      <div class="innerArea">
        <div v-if="!mobile" class="topbar">
          <img @click="goHome()" draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
          <div class="buttons">
            <a class="hover-underline-animation" @click="changeTab(tab)" v-for="tab in tabs" :key="tab">
              <h3 class="unselectable" :class="{'text-primary': intersectedTab === tab}">
                {{ capitalize(tab) }}
              </h3>
            </a>
            <QuipButton href="https://www.apple.com/app-store/" target="_blank" icon="material-symbols:download-rounded" class="bg-primary mr-3">
              <h3 class="font-weight-bold text-white">
                Download App
              </h3>
            </QuipButton>
            <QuipButton @click="openLoginModal" :width="130" class="login text-jetblack">
              <h3 class="font-weight-bold">
                Login
              </h3>
            </QuipButton>
          </div>
        </div>
        <div v-else class="topbarMobile" :class="{'topbarMobileOpen': isOpen}">
          <div class="topbar w-100 mb-4">
            <img @click="goHome()" draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
            <div class="buttons">
              <IconButton href="https://www.apple.com/app-store/" target="_blank" icon="ic:outline-file-download" class="bg-primary mr-2" />
              <IconButton @click="toggleMobileMenu" :icon="isOpen? 'material-symbols:close-rounded' : 'material-symbols:menu'" class="login text-jetblack"/>
            </div>
          </div>
          <transition-group tag="div" name="fade-slide" :style="{ '--total': tabs.length+1 }">
            <div class="d-flex align-center" v-for="(tab, i) in tabs" :key="i" :style="{'--i': i}" v-if="isOpen" @click="changeTab(tab)">
              <Icon class="mobileIcon unselectable mr-2" :icon="tabIcons[tab]" :class="{'text-primary': intersectedTab === tab, 'subtext': intersectedTab !== tab}"/>
              <a class="py-4">
                <h3 class="unselectable" :class="{'text-primary': intersectedTab === tab, 'subtext': intersectedTab !== tab}">{{ capitalize(tab) }}</h3>
              </a>
            </div>
            <div class="d-flex align-center" :key="tabs.length" :style="{'--i': tabs.length}" v-if="isOpen" @click="openLoginModal">
              <Icon class="mobileIcon unselectable mr-2" icon="material-symbols:login-rounded"/>
              <a class="py-4">
                <h3 class="unselectable">Login</h3>
              </a>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/mixins.scss';
@import '@/styles/transitions.scss';

.topbarHeight {
  @include md-up {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  @include sm-down {
    height: 77px;
  }
}

.topbarBase {
  z-index: 100;
  width: 100%;
  padding: 18px 64px;

  @include md-down {
    padding: 18px 32px;
  }

  @include sm-down {
    padding: 18px 24px;
  }

  background: v-bind('colors.background');
  transition: background $transitionTime ease-in-out, border-bottom-color $transitionTime ease-in-out;
  border-bottom: solid 1px transparent;

  @include sm-down {
    position: fixed;
    background: v-bind('colors["grey-light"]');
    transition: border-bottom-color $transitionTime ease-in-out;
  }

  overflow: hidden;
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
  height: 40px;
}

.topbarMobile {
  height: 40px;
  transition: height $transitionTime ease-in-out;
  transition-delay: .35s;
}

.topbarMobileOpen {
  height: 316px;
  transition-delay: 0s;
}

.mobileIcon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color $transitionTime ease-in-out, inopacity $transitionTime ease--out;
}

.logo {
  height: 90%;
  cursor: pointer;
}

a {
  background: none;
  border: none;
  cursor: pointer;
  padding: 13px 20px;

  @include sm-down {
    padding: 0;
  }

  transition: color $transitionTime ease-in-out, inopacity $transitionTime ease--out;
}

h3 {
  font-weight: normal;
  font-size: 16px;

  @include md-down {
    font-size: 16px;
    line-height: 20px;
  }

  transition: color $transitionTime ease-in-out, inopacity $transitionTime ease--out;
  color: v-bind("colors.jetblack");
}

.subtext {
  opacity: .4;
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
