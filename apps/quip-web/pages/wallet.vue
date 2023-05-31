<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipDivider from "~/components/util/QuipDivider.vue";
import Tabs from "~/components/util/Tabs.vue";
import QuipInput from "~/components/util/QuipInput.vue";
import {Icon} from "@iconify/vue";
import QuipButton from "~/components/util/QuipButton.vue";
import QuipQrCode from "~/components/util/QuipQrCode.client.vue";
import CryptoInput from "~/components/util/CryptoInput.vue";
import QuipAnimatedCard from "~/components/util/QuipAnimatedCard.vue";

const colors = useTheme().current.value.colors
const { $crypto, $ticker } = useNuxtApp()
const {metadata, balance, send} = $crypto

/* UI STATE */
const walletTabs = ['Receive', 'Send'] as const
type WalletTab = typeof walletTabs[number]
const currentTab = ref<WalletTab>(walletTabs[0])

const transferType = ref<string>('SOL')
const solValue = ref<number>(0)
const addressInput = ref("")

function copyAddress() {
  if (!metadata.value || !metadata.value.publicAddress) return;
  navigator.clipboard.writeText(metadata.value.publicAddress);
}

/* WEB3 SOLANA STUFF */
const computedBalance = computed(() => {
  if (!balance.value) return '0.00';
  return (balance.value * $ticker.usdPrice.value).toFixed(2);
})

const computedAddress = computed(() => {
  if (!metadata.value || !metadata.value.publicAddress) return null;
  return metadata.value.publicAddress.substring(0, 4) + "..." + metadata.value.publicAddress.substring(metadata.value.publicAddress.length - 4);
})

function doSend() {
  send(addressInput.value, solValue.value)
}

onBeforeMount(() => {
  $ticker.init()
  $crypto.init()
})
</script>

<template>
  <div class="w-100 h-100 d-flex align-center justify-center">
    <QuipAnimatedCard v-if="metadata" has-border is-animated class="bg-white wallet d-flex flex-column walletCard">
      <div class="pa-6">
        <h3>Your Balance</h3>
        <div class="d-flex mt-1">
          <img class="solanaLogo my-auto mr-3" src="/solanaLogoMark.svg" alt="solana logo">
          <transition mode="out-in" name="fade-fast">
            <h3 :key="balance" class="balance mr-3 text-primary">
              {{ balance }} SOL
            </h3>
          </transition>
          <transition mode="out-in" name="fade-fast">
            <h3 :key="computedBalance" class="mt-auto">
              ~${{ computedBalance }}
            </h3>
          </transition>
        </div>
        <Tabs class="unselectable mt-6" :tabs="walletTabs" v-model="currentTab"/>
        <QuipDivider class="mb-6"/>
        <transition mode="out-in" name="fade-slide">
          <div v-if="currentTab === 'Send'">
            <div>
              <h3 class="mb-2 subtext">
                Choose Amount
              </h3>
              <CryptoInput :label="`Amount (${transferType})`" @update:sol-value="value => solValue = value" v-model:is-usd="transferType"/>
            </div>
            <div class="mt-6">
              <h3 class="mb-2 subtext">
                Wallet Address
              </h3>
              <QuipInput v-model="addressInput" label="Solana Address" type="text"/>
            </div>
            <div class="w-100 d-flex mt-6">
              <QuipButton @click="doSend" :icon-size="18" :prepend-icon="false" icon="akar-icons:paper-airplane" class="bg-primary w-100">
                <h3 class="text-white">Send</h3>
              </QuipButton>
            </div>
          </div>
          <div v-else-if="currentTab === 'Receive'">
            <div>
              <h3 class="mb-2 subtext">
                QR Code
              </h3>
              <div v-if="metadata.publicAddress" class="d-flex align-center justify-center">
                <QuipQrCode :data="metadata.publicAddress" :size="160"/>
              </div>
            </div>
            <div class="mt-6">
              <h3 class="mb-2 subtext">
                Wallet Address
              </h3>
              <div @click="copyAddress" v-ripple class="address text-border-grey rounded-pill d-flex align-center px-6 unselectable justify-space-between">
                <h3 class="addressText text-secondary-grey">
                  {{ computedAddress }}
                </h3>
                <Icon class="copyIcon text-primary" icon="material-symbols:content-copy-outline-rounded"/>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </QuipAnimatedCard>
  </div>
</template>

<style scoped lang="scss">
.wallet {
  min-width: 400px;
  min-height: 500px;
  border-radius: 24px;
  box-shadow: 0 12px 56px rgba(119,118,122,.15);
}

h3 {
  color: v-bind("colors.jetblack");
}

.solanaLogo {
  width: 28px;
  height: 28px;
}

.balance {
  font-weight: 700;
  font-size: 32px;
  line-height: 37px;
}

.address {
  height: 48px;
  border: 1px solid;
  cursor: pointer;
}

.subtext {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  opacity: 0.4;
}

.addressText {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.copyIcon {
  font-size: 24px;
}

.walletCard {
  min-height: 444px !important;
}
</style>
