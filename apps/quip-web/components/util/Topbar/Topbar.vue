<script setup lang="ts">
import HomeTopbar from "~/components/util/Topbar/HomeTopbar.vue";
import LandingTopbar from "~/components/util/Topbar/LandingTopbar.vue";
import {Tab} from "~/utils/types";
import {scrollIntoViewWithOffset} from "~/utils/scroll";
import {useDisplay} from "vuetify";
import {useTopbar} from "~/store/TopbarStore";

const {mobile} = useDisplay()
const route = useRoute()
const isLanding = computed(() => route.name === "index" || route.name === "test")

const topbar = useTopbar()
const homeRef = computed(() => topbar.homeRef)
const aboutRef = computed(() => topbar.aboutRef)
const gamesRef = computed(() => topbar.gamesRef)
const faqRef = computed(() => topbar.faqRef)

function scrollToTab(tab: Tab) {
  if (!mobile.value) {
    switch (tab) {
      case 'home':
        scrollIntoViewWithOffset(homeRef.value, 100)
        break
      case 'about':
        scrollIntoViewWithOffset(aboutRef.value, 140)
        break
      case 'games':
        scrollIntoViewWithOffset(gamesRef.value, 95)
        break
      case 'faq':
        scrollIntoViewWithOffset(faqRef.value, -30)
        break
    }
  } else {
    switch (tab) {
      case 'home':
        scrollIntoViewWithOffset(homeRef.value, 100)
        break
      case 'about':
        scrollIntoViewWithOffset(aboutRef.value, 95)
        break
      case 'games':
        scrollIntoViewWithOffset(gamesRef.value, 90)
        break
      case 'faq':
        scrollIntoViewWithOffset(faqRef.value, 77)
        break
    }
  }
}

const tabSections = computed(() => [
  ['home'   as Tab, homeRef.value],
  ['about'  as Tab, aboutRef.value],
  ['games'  as Tab, gamesRef.value],
  ['faq'    as Tab, faqRef.value],
])
</script>

<template>
  <ClientOnly>
    <LandingTopbar :tab-sections="tabSections" @tab="scrollToTab" v-if="isLanding"/>
    <HomeTopbar v-else/>
  </ClientOnly>
</template>

<style scoped lang="scss">

</style>
