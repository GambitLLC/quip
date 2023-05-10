<script setup lang="ts">
import QuipCard from "~/components/util/QuipCard.vue";
import {useTheme} from "vuetify";
import {useUser} from "~/store/UserStore";
import VisibilityIcon from "~/components/profile/VisibilityIcon.vue";

const user = useUser()
const colors = useTheme().current.value.colors

const showName = ref(false)
const showDOB = ref(false)
const showAddress = ref(false)

const computedName = computed(() => {
  if (!showName.value && user.user?.personalInfo) {
    const split = user.user?.personalInfo.legalName.split(" ")
    return split[0][0] + "*".repeat(split[0].length-1) + " " + split[1][0] + "*".repeat(split[1].length-1)
  }
  else return user.user?.personalInfo.legalName
})

const computedDob = computed(() => {
  if (!showDOB.value) return "**/**/****"

  const dob = user.user?.personalInfo.dob
  if (dob) {
    return `${dob.getMonth()}/${dob.getDate()}/${dob.getFullYear()}`
  }
  return ""
})

const computedAddress = computed(() => {
  if (!showAddress.value && user.user?.personalInfo) {
    const split = user.user.personalInfo.address.split(", ")
    return "*".repeat(split[0].length) + ", " + "*".repeat(split[1].length) + ", " + split[2]
  }

  return user.user?.personalInfo.address
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
      <div class="d-flex align-center">
        <VisibilityIcon v-model="showName"/>
        <h3 class="info">{{computedName}}</h3>
      </div>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Date of Birth</h3>
      <div class="d-flex align-center">
        <VisibilityIcon v-model="showDOB"/>
        <h3 class="info">{{computedDob}}</h3>
      </div>
    </div>
    <v-divider class="text-border-grey divider"/>
    <div class="px-8 cardRow">
      <h3 class="subtext">Address</h3>
      <div class="d-flex align-center">
        <VisibilityIcon v-model="showAddress"/>
        <h3 class="info">{{computedAddress}}</h3>
      </div>
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
@import "styles.scss";
</style>
