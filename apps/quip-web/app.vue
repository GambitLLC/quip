<script setup lang="ts">
import {useTheme} from "vuetify";
import {useWindowScroll} from "@vueuse/core";
import {computed} from "vue";

const { x, y } = useWindowScroll()

const bottomBG = useTheme().current.value.colors["jetblack"]
const topBG = useTheme().current.value.colors["background"]
let faqTop = 500

const computedBG = computed(() => y.value > faqTop ? bottomBG : topBG)

onMounted(() => {
  const faq = document.getElementById('faq')
  faqTop = faq?.getBoundingClientRect().y ?? 500
})

watch(computedBG, (value) => {
    const r = document.querySelector(':root') as HTMLElement;
    r.style.setProperty('--computedBG', value);
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
  background: var(--computedBG)
}
</style>
