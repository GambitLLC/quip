<script setup lang="ts">
import QuipCard from "~/components/util/QuipCard.vue";
import {useReferral} from "~/store/ReferalStore";
import {Icon} from "@iconify/vue";
import {getLang} from "~/store/UserStore";
import {useTheme} from "vuetify";
import {useElementSize} from "@vueuse/core";
import QuipInput from "~/components/util/QuipInput.vue";
import QuipButton from "~/components/util/QuipButton.vue";

const colors = useTheme().current.value.colors
const referral = useReferral()

const getCurrencySymbol = (locale: string, currency: string) => (0).toLocaleString(locale, {
  style: 'currency',
  currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
}).replace(/\d/g, '').trim()

const computedLocalCurrency = computed(() => {
  return getCurrencySymbol(getLang(), "USD")
})

function formatDate(date: Date) {
  const month = date.getMonth()
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

const tableRef = ref<HTMLElement | null>(null)
const {width, height} = useElementSize(tableRef)
const computedHeight = computed(() => `${height.value - 16 - 20 - 25}px`)
</script>

<template>
  <div>
    <QuipCard has-border class="bg-white contentCard pa-8">
      <h3>Refer a Friend</h3>
      <h3 class="subtext inviteText mt-2 mb-4">Invite your friends to Quip. For every new users invited you will earn
        $3.00</h3>
      <div class="mb-4">
        <h3 class="subtext inviteText mb-2">Send Invites</h3>
        <QuipInput label="Email Address" type="email">
          <QuipButton class="bg-primary ma-1" :style="{height: '38px'}" :width="78"><h3 class="sendBtn">Send</h3></QuipButton>
        </QuipInput>
      </div>
      <div>
        <h3 class="subtext inviteText mb-2">Or use your referral URL</h3>
        <div :style="{height: '48px'}" class="referralBorder rounded-pill px-6 d-flex align-center justify-space-between">
          <h3 class="text-secondary-grey textLink">
            {{ referral.referralLink }}
          </h3>
          <div v-ripple class="copyIcon text-primary">
            <Icon icon="material-symbols:content-copy-outline-rounded" class="text-primary"/>
          </div>
        </div>
      </div>
    </QuipCard>
    <div class="d-flex mt-4">
      <div class="mr-4 flex-shrink-0">
        <QuipCard has-border class="bg-white roundedCardSmall px-8 py-6 d-flex flex-column align-center mb-4">
          <Icon icon="ic:twotone-people-alt" class="text-primary referralIcon"/>
          <h3 class="referralText my-2">Friends Invited</h3>
          <h3>{{ referral.totalReferrals }}</h3>
        </QuipCard>
        <QuipCard has-border class="bg-white roundedCardSmall px-8 py-6 d-flex flex-column align-center">
          <Icon icon="solar:medal-ribbons-star-bold-duotone" class="text-primary referralIcon"/>
          <h3 class="referralText my-2">Money Earned</h3>
          <h3>{{ computedLocalCurrency + referral.totalEarned }}</h3>
        </QuipCard>
      </div>
      <div class="w-100">
        <QuipCard has-border class="bg-white roundedCardSmall px-6 py-8 w-100 h-100 d-flex flex-column">
          <h3>Your Referrals</h3>
          <div ref="tableRef" class="h-100 w-100 position-relative">
            <div class="position-absolute h-100 w-100">
              <div class="mt-4 w-100">
                <table class="w-100 fixed_header">
                  <thead class="bg-white">
                  <tr class="text-left">
                    <th><h3 class="subtext">Date</h3></th>
                    <th><h3 class="subtext">Username</h3></th>
                    <th><h3 class="subtext">Amount Earned</h3></th>
                    <th><h3 class="subtext">Status</h3></th>
                  </tr>
                  </thead>
                  <v-divider class="divider text-border-grey my-3"/>
                  <tbody>
                  <tr v-for="(r, i) in referral.referrals">
                    <td :class="{'pb-4': i < referral.referrals.length-1}"><h3 class="tableText">
                      {{ formatDate(r.date) }}</h3></td>
                    <td :class="{'pb-4': i < referral.referrals.length-1}"><h3 class="tableText">{{ r.username }}</h3>
                    </td>
                    <td :class="{'pb-4': i < referral.referrals.length-1}"><h3 class="tableText">
                      {{ computedLocalCurrency + r.amountEarned }}</h3></td>
                    <td :class="{'pb-4': i < referral.referrals.length-1}"><h3 class="tableText">{{ r.status }}</h3></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </QuipCard>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "styles.scss";

.sendBtn {
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
}

.copyIcon {
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.textLink {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.inviteText {
  max-width: 332px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
}

.referralIcon {
  font-size: 42px;
}

.referralText {
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  opacity: 0.4;
}

.referrals {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}

.tableText {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.tableHeaderText {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
}

.fixed_header {
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
}

.fixed_header tbody {
  display: block;
  overflow: auto;
  height: v-bind(computedHeight);
}

tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.referralBorder {
  border: 1px solid v-bind("colors['border-grey']")
}

/* width */
::-webkit-scrollbar {
  width: 4px;
  border-radius: 20px;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgba(184, 206, 221, 0.3);
  border-radius: 20px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: v-bind("colors['primary']");
  border-radius: 20px;
}
</style>
