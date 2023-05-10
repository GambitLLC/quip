<script setup lang="ts">
import QuipCard from "~/components/util/QuipCard.vue";
import {getLang} from "~/store/UserStore";

const computedTimezone = computed(() => { return new Date().toString().split(" ").slice(5).join(" ") })
const getCurrencySymbol = (locale: string, currency: string) => (0).toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim()
const computedLocalCurrency = computed(() => { return `USD (${getCurrencySymbol(getLang(), "USD")})` })
</script>

<template>
  <QuipCard has-border class="bg-white contentCard">
    <div class="px-8 cardHeader">
      <h3>Preferences</h3>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Timezone</h3>
      <h3 class="info">{{ computedTimezone }}</h3>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Local Currency</h3>
      <h3 class="info">{{ computedLocalCurrency }}</h3>
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
@import "styles.scss";
</style>
