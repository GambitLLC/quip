<script setup lang="ts">
import {useScroll} from "~/utils/scroll";
import {useTheme} from "vuetify";
import Avatar from "~/components/util/Avatar/Avatar.vue";
import {useUser} from "~/store/UserStore";

const { isScrolled } = useScroll()
const {colors} = useTheme().current.value

const router = useRouter()
const user = useUser().user
const computedRoute = computed(() => router.currentRoute.value.name)

const { $crypto, $ticker } = useNuxtApp()
const { balance } = $crypto

onBeforeMount(() => {
  $ticker.init()
  $crypto.init()
})
</script>

<template>
  <div class="topbarBase safeArea" :class="{'topbarBaseScrolled': isScrolled}">
    <div class="topbar">
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
            <transition mode="out-in" name="fade-fast">
              <h3 :key="balance" class="text-primary">
                {{ balance ?? "..." }} SOL
              </h3>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

$transitionTime: 0.3s;

.topbarBase {
  padding: 18px 64px;

  @include md-down {
    padding: 18px 32px;
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

  @include sm-down {
    background: v-bind('colors["grey-light"]');
    transition: border-bottom-color $transitionTime ease-in-out;
  }
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
</style>
