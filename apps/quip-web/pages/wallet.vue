<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipDivider from "~/components/util/QuipDivider.vue";
import {Icon} from "@iconify/vue";
import QuipAnimatedCard from "~/components/util/QuipAnimatedCard.vue";
import Skeleton from "~/components/util/Skeleton.vue";
import Tabs from "../components/util/Tabs/Tabs.vue";
import Tab from "~/components/util/Tabs/Tab.vue";
import LdsSpinner from "~/components/util/LdsSpinner.vue";
import WalletReceive from "~/components/wallet/WalletReceive.client.vue"
import WalletSend from "~/components/wallet/WalletSend.client.vue"
import WalletOnramp from "~/components/wallet/WalletOnramp.client.vue"
import QuipButton from "~/components/util/QuipButton.vue";
import { watchOnce } from "@vueuse/core";

const colors = useTheme().current.value.colors
const { metadata, balance } = useCrypto()
const ticker = useTicker()

/* UI STATE */
type WalletFlow =  "info" | "loading" | "send" | "deposit" | "buy"
const walletFlows: WalletFlow[] = ["info", "send", "deposit", "buy"]
const walletFlowIcons = ["material-symbols:info-outline-rounded", "material-symbols:arrow-upward-rounded", "material-symbols:arrow-downward-rounded", "material-symbols:credit-card-outline"]
const currentState = ref<WalletFlow>("loading")

function changeFlow(flow: WalletFlow) {
  if (currentState.value === "loading") return;

  currentState.value = flow
}

watch(metadata, (newMetadata) => {
  newMetadata ? currentState.value = "info" : currentState.value = "loading"
}, {immediate: true})

/* WEB3 SOLANA STUFF */
const computedBalance = computed(() => {
  if (!balance.value) return '0.00';
  return (balance.value * ticker.usdPrice.value).toFixed(2);
})

disableScroll()
</script>

<template>
  <div class="w-100 h-100 d-flex align-center justify-center pa-4">
    <QuipAnimatedCard has-border is-animated class="bg-white wallet d-flex flex-column">
      <div class="pa-4 h-100 d-flex flex-column">
        <div class="my-10">
          <div class="d-flex align-center justify-center">
            <Icon class="mr-1 text-jetblack balanceIcon" icon="fa:usd"/>
            <Skeleton width="100px" height="36px" :loading="balance === null">
              <transition mode="out-in" name="fade-fast">
                <h3 :key="computedBalance" class="balance">{{ computedBalance }}</h3>
              </transition>
            </Skeleton>
          </div>
          <div class="d-flex align-center justify-center">
            <Icon class="mr-1 text-jetblack subBalanceIcon" icon="mingcute:solana-sol-fill"/>
            <Skeleton width="100px" height="19px" :loading="balance === null">
              <transition mode="out-in" name="fade-fast">
                <h3 :key="balance" class="subBalance">{{ balance }}</h3>
              </transition>
            </Skeleton>
          </div>
        </div>
        <div class="d-flex align-center justify-space-between text-primary">
          <div v-ripple v-for="(flow, i) in walletFlows" :key="flow" @click="changeFlow(flow)" class="d-flex flex-column align-center px-4 py-2 unselectable walletFlow">
            <Icon class="iconLabel mb-1" :class="{'flowLabelSelected': (currentState === flow) || (flow === 'info' && currentState === 'loading')}" :icon="walletFlowIcons[i]"/>
            <h3 class="flowLabel text-primary" :class="{'flowLabelSelected': (currentState === flow) || (flow === 'info' && currentState === 'loading')}">{{capitalize(flow)}}</h3>
          </div>
        </div>
        <QuipDivider class="mb-3"/>
        <transition mode="out-in" name="fade">
          <LdsSpinner class="d-flex align-center justify-center mx-auto flex-grow-1 spinnerSpace" v-if="currentState === 'loading'"/>
          <WalletInfo v-else-if="currentState === 'info'"/>
          <WalletReceive v-else-if="currentState === 'deposit'"/>
          <WalletSend v-else-if="currentState === 'send'"/>
          <WalletOnramp v-else-if="currentState === 'buy'"/>
        </transition>
      </div>
    </QuipAnimatedCard>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.flowBtn {
  transition: background-color 0.3s ease-in-out;
}

.wallet {
  min-width: 400px;
  min-height: 550px;
  border-radius: 24px;
  box-shadow: 0 12px 56px rgba(119,118,122,.15);

  @include sm-down {
    min-width: 100%;
  }
}

h3 {
  color: v-bind("colors.jetblack");
}

.walletFlow {
  cursor: pointer;
  border-radius: 10px 10px 0px 0px;
}

.flowLabel {
  transition: opacity 0.25s ease-in-out;
  font-size: 12px;
  letter-spacing: 1.2px;
  opacity: .4;
}

.iconLabel {
  transition: opacity 0.25s ease-in-out;
  font-size: 24px;
  letter-spacing: 1.2px;
  opacity: .4;
}

.flowLabelSelected {
  opacity: 1;
}

.balance {
  font-weight: 700;
  font-size: 32px;
  line-height: 37px;
}

.balanceIcon {
  font-size: 28px;
}

.subBalance {
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  opacity: 0.4;
}

.subBalanceIcon {
  font-size: 16px;
  opacity: 0.4;
}

.subtext {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  opacity: 0.4;
}

.spinnerSpace {
  height: 230px;
}
</style>
