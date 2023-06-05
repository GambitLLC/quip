<script setup lang="ts">
import QuipButton from "~/components/util/QuipButton.vue";
import QuipCard from "~/components/util/QuipCard.vue";
import {useTheme} from "vuetify";
import {useUser} from "~/store/UserStore";
import {useElementSize} from "@vueuse/core";
import VisibilityIcon from "~/components/profile/VisibilityIcon.vue";
import Skeleton from "~/components/util/Skeleton.vue";

const colors = useTheme().current.value.colors
const user = useUser().user

const showEmail = ref(false)
const fullCryptoAddress = ref(false)
const emailRef = ref<HTMLElement | null>(null)
const {width, height} = useElementSize(emailRef)

const { address, shortAddress } = useCrypto()

const computedEmail = computed(() => {
  const showAmt = 1
  if (showEmail.value) {
    return user?.email ? user.email : "No Email"
  } else {
    if (user?.email) {
      const split = user.email.split("@")
      return split[0].slice(0,showAmt) + "*".repeat(split[0].length-showAmt) + "@" + split[1]
    } else {
      return "No Email"
    }
  }
})
</script>

<template>
  <div>
    <QuipCard has-border class="bg-white contentCard">
      <div class="d-flex align-center cardHeader px-8">
        <h3>
          General Info
        </h3>
      </div>
      <v-divider class="text-border-grey divider"/>
      <div class="cardRow px-8">
        <h3 class="subtext">Display Name</h3>
        <h3 class="info">
          {{user?.name}}
        </h3>
      </div>
      <v-divider class="text-border-grey divider"/>
      <div class="cardRow px-8">
        <h3 class="subtext">Email Address</h3>
        <div class="d-flex align-center">
          <h3 ref="emailRef" class="info email">
            {{computedEmail}}
          </h3>
          <VisibilityIcon v-model="showEmail"/>
        </div>
      </div>
      <v-divider class="text-border-grey divider"/>
      <div class="cardRow px-8">
        <h3 class="subtext">Solana Address</h3>
        <div class="d-flex align-center">
          <Skeleton width="108px" :loading="shortAddress === null" height="21px">
            <h3 class="info">
              {{fullCryptoAddress? address : shortAddress}}
            </h3>
          </Skeleton>
          <VisibilityIcon v-model="fullCryptoAddress"/>
        </div>
      </div>
    </QuipCard>
    <QuipCard has-border class="bg-white contentCard mt-7">
      <div class="d-flex flex-row align-center pa-8 w-100">
        <div :style="{maxWidth: '378px'}">
          <div class="mb-3">
            <h3>Close Account</h3>
          </div>
          <div>
            <h3 class="subtextClose">
              Closing your account can’t be undone. Please make sure your account balance is $0.00 before you begin.
            </h3>
          </div>
        </div>
        <div class="flex-grow-1"/>
        <QuipButton :width="188" class="text-red closeBorder">
          <div class="text-red">
            Close Account
          </div>
        </QuipButton>
      </div>
    </QuipCard>
  </div>
</template>

<style scoped lang="scss">
@import "styles.scss";

.subtextClose {
  opacity: 0.4;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
}

.closeBorder {
  border: solid 2px v-bind("colors.jetblack");
}

.email {
  width: v-bind("computedEmailWidth");
}
</style>
