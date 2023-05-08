<script setup lang="ts">
import QuipCard from "~/components/util/QuipCard.vue";
import {useTheme} from "vuetify";
import {useUser} from "~/store/UserStore";

const user = useUser()
const colors = useTheme().current.value.colors

const computedDob = computed(() => {
  const dob = user.user?.personalInfo.dob
  if (dob) {
    return `${dob.getMonth()}/${dob.getDate()}/${dob.getFullYear()}`
  }
  return ""
})
</script>

<template>
  <QuipCard has-border class="bg-white contentCard">
    <div class="px-8 cardHeader">
      <h3>Personal Info</h3>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Legal Name</h3>
      <h3 class="info">{{user.user?.personalInfo.legalName}}</h3>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Date of Birth</h3>
      <h3 class="info">{{computedDob}}</h3>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Address</h3>
      <h3 class="info">{{user.user?.personalInfo.address}}</h3>
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
@import "styles.scss";
</style>
