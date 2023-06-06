<script setup lang="ts">
import {useScroll} from "~/utils/scroll";
import { useDisplay, useTheme } from "vuetify";
import Avatar from "~/components/util/Avatar/Avatar.vue";
import {useUser} from "~/store/UserStore";
import Skeleton from "~/components/util/Skeleton.vue";
import {Icon} from "@iconify/vue";
import { vOnClickOutside } from '@vueuse/components'
import IconButton from "~/components/util/IconButton.vue";
import { capitalize } from "~/utils/text";
import { HomeTab } from "~/utils/types";
import { useEventListener } from "@vueuse/core";

const logout = useLogout()

const {mobile} = useDisplay()

const { isScrolled } = useScroll()
const {colors} = useTheme().current.value

const router = useRouter()
const user = useUser().user
const computedRoute = computed(() => router.currentRoute.value.name)

const crypto = useCrypto()
const { balance } = crypto

const computedBalance = computed(() => {
  const bal = balance.value
  if (bal === null) return null

  //if bal contains a decimal with more than 4 places display the fixed string
  if (bal.toString().split('.')[1]?.length > 4) return bal.toFixed(4) + '...'
  //otherwise display the string
  return bal.toString()
})

const isOpen = ref(false)

function toggleMobileMenu() {
  isOpen.value = !isOpen.value
}

const tabs: HomeTab[] = ['home', 'wallet', 'profile']
const tabIcons = {
  home: 'material-symbols:home-outline-rounded',
  wallet: 'material-symbols:wallet',
  profile: 'material-symbols:account-circle',
}

function doLogout() {
  logout()
  router.push({name: 'index'})
}

function pushTab(tab: HomeTab) {
  router.push({name: tab})
  isOpen.value = false
}

useEventListener('scroll', (e) => {
  if (isOpen.value) isOpen.value = false
})

const threshold = 60 //px
const touchStart = ref({x: 0, y: 0})

useEventListener('touchstart', (e) => {
  touchStart.value = {x: e.touches[0].clientX, y: e.touches[0].clientY}
})

useEventListener('touchend', (e) => {
  const xDiff = touchStart.value.x - e.changedTouches[0].clientX
  const yDiff = touchStart.value.y - e.changedTouches[0].clientY

  //if the user swiped up more than the threshold, close the menu
  if (yDiff > threshold) isOpen.value = false
})
</script>

<template>
  <div v-on-click-outside="() => isOpen = false" class="topbarBase safeArea" :class="{'topbarBaseScrolled': isScrolled || isOpen}">
    <div class="innerArea">
      <div v-if="!mobile" class="topbar">
        <NuxtLink to="/" class="logo">
          <img draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
        </NuxtLink>
        <div class="buttons">
          <NuxtLink to="/home" class="hover-underline-animation text-jetblack">
            <h3 :class="{'text-primary': computedRoute === 'home'}">
              Home
            </h3>
          </NuxtLink>
          <NuxtLink to="/wallet" class="hover-underline-animation text-jetblack">
            <h3 :class="{'text-primary': computedRoute === 'wallet'}">
              Wallet
            </h3>
          </NuxtLink>
          <NuxtLink to="/profile" class="hover-underline-animation text-jetblack">
            <h3 :class="{'text-primary': computedRoute === 'profile'}">
              Profile
            </h3>
          </NuxtLink>
          <div class="ml-6 d-flex align-center" v-if="user">
            <Avatar
              :size="44"
              :eye="user.avatar.eye"
              :face="user.avatar.face"
              :mouth="user.avatar.mouth"
              :outfit="user.avatar.outfit"
              :color="user.avatar.color"
              :hair="user.avatar.hair"
              :accessory="user.avatar.accessory"
            />
            <div class="ml-3">
              <h3 class="username">
                {{ user.name }}
              </h3>
              <div class="d-flex align-center">
                <Icon class="mr-1 balanceIcon text-primary" icon="mingcute:solana-sol-fill"/>
                <Skeleton width="75px" height="20px" :loading="balance === null">
                  <transition mode="out-in" name="fade-fast">
                    <h3 @click="$router.push('/wallet')" :title="balance + ' SOL'" :key="balance" class="text-primary balanceHover unselectable">{{ computedBalance }}</h3>
                  </transition>
                </Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="topbarMobile" :class="{'topbarMobileOpen': isOpen}">
        <div class="topbar w-100 mb-4">
          <NuxtLink to="/" class="logo">
            <img draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
          </NuxtLink>
          <div class="d-flex align-center">
            <div v-if="user">
              <Avatar
                :size="48"
                :eye="user.avatar.eye"
                :face="user.avatar.face"
                :mouth="user.avatar.mouth"
                :outfit="user.avatar.outfit"
                :color="user.avatar.color"
                :hair="user.avatar.hair"
                :accessory="user.avatar.accessory"
              />
            </div>
            <IconButton @click="toggleMobileMenu" :icon="isOpen? 'material-symbols:close-rounded' : 'material-symbols:menu'" class="login text-jetblack ml-2"/>
          </div>
        </div>
        <transition-group tag="div" name="fade-slide" :style="{ '--total': tabs.length+1 }">
          <div @click="pushTab(tab)" class="d-flex align-center" v-for="(tab, i) in tabs" :key="i" :style="{'--i': i}" v-if="isOpen">
            <Icon class="mobileIcon unselectable mr-2" :icon="tabIcons[tab]" :class="{'text-primary': computedRoute === tab, 'subtext': computedRoute !== tab}"/>
            <a class="py-4">
              <h3 class="unselectable" :class="{'text-primary': computedRoute === tab, 'subtext': computedRoute !== tab}">{{capitalize(tab)}}</h3>
            </a>
          </div>
          <div @click="doLogout" class="d-flex align-center" :key="3" :style="{'--i': 3}" v-if="isOpen">
            <Icon class="mobileIcon unselectable mr-2 text-jetblack" icon="material-symbols:logout-rounded"/>
            <a class="py-4">
              <h3 class="unselectable">Logout</h3>
            </a>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";
$transitionTime: 0.3s;

.topbarBase {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  flex: 1 0 auto;

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

.logo {
  height: 36px;
  padding: 0;
}

a {
  text-decoration: none;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  padding: 13px 20px;
}

h3 {
  transition: color $transitionTime ease-in-out;

  font-weight: normal;
  font-size: 16px;

  @include md-down {
    font-size: 16px;
    line-height: 20px;
  }

  color: v-bind("colors.jetblack");
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.username {
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
}

.balanceHover {
  cursor: pointer;
}

//-- mobile --
.topbarMobile {
  height: 40px;
  transition: height $transitionTime ease-in-out;
  transition-delay: .2s;
}

.topbarMobileOpen {
  height: 264px;
  transition-delay: 0s;
}

.login {
  border: solid 2px;
}

.mobileIcon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color $transitionTime ease-in-out, inopacity $transitionTime ease--out;
}

.subtext {
  opacity: .4;
}
</style>
