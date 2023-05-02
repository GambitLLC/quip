<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";
import {useWindowScroll} from "@vueuse/core";
import {computed} from "vue";
import {useRoute} from "#app";
import Topbar from "~/components/util/Topbar/Topbar.vue";

const route = useRoute()

const {mobile} = useDisplay()
const { x, y } = useWindowScroll()

const faqBG = useTheme().current.value.colors["jetblack"]
const topBG = useTheme().current.value.colors["white"]
const nonBG = useTheme().current.value.colors["background"]

let faqTop: number = 1000
const doAnimate = ref(false)

const isLandingPage = computed(() => route.name === 'index')

const computedBG = computed(() => {
  if (!isLandingPage.value) return nonBG
  if (mobile.value) return topBG

  if (y.value <= 0) {
    return nonBG
  } else if (y.value > 0 && y.value < faqTop) {
    return topBG
  } else {
    return faqBG
  }
})

watch(computedBG, (value, oldValue) => {
  if (!isLandingPage.value) {
    doAnimate.value = false
    const r = document.querySelector(':root') as HTMLElement;
    r.style.setProperty('--computedBG', value);
    return;
  }

  if (mobile.value) return
  doAnimate.value = (value === nonBG && oldValue === topBG) || (value === topBG && oldValue === nonBG);

  const r = document.querySelector(':root') as HTMLElement;
  r.style.setProperty('--computedBG', value);
})

watch(doAnimate, (value) => {
  if (mobile.value || !isLandingPage) {
    document.body.classList.remove("doAnimate")
    return
  }
  if (value) document.body.classList.add("doAnimate")
  else document.body.classList.remove("doAnimate")
})

onMounted(() => {
  if (!isLandingPage.value) {
    document.body.classList.remove("doAnimate")
    const r = document.querySelector(':root') as HTMLElement;
    r.style.setProperty('--computedBG', computedBG.value );
    return
  }

  if (mobile.value || !isLandingPage) {
    document.body.classList.remove("doAnimate")
    const r = document.querySelector(':root') as HTMLElement;
    r.style.setProperty('--computedBG', topBG );
  }
})
</script>

<template>
  <router-view/>
</template>

<style>
:root {
  --computedBG: #F0F9FF
}

body {
  background: var(--computedBG);
}

.doAnimate {
  transition: background ease-in-out 0.3s;
}
</style>
