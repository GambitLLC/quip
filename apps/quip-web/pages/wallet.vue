<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipDivider from "~/components/util/QuipDivider.vue";
import Tabs from "~/components/util/Tabs.vue";
import {Icon} from "@iconify/vue";
import QuipAnimatedCard from "~/components/util/QuipAnimatedCard.vue";
import Skeleton from "~/components/util/Skeleton.vue";
import LdsSpinner from "~/components/util/LdsSpinner.vue";

const colors = useTheme().current.value.colors
const {metadata, balance, send} = useCrypto()
const ticker = useTicker()

/* UI STATE */
const walletTabs = ['Receive', 'Send'] as const
type WalletTab = typeof walletTabs[number]
const currentTab = ref<WalletTab>(walletTabs[0])

/* WEB3 SOLANA STUFF */
const computedBalance = computed(() => {
  if (!balance.value) return '0.00';
  return (balance.value * ticker.usdPrice.value).toFixed(2);
})
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
        <Tabs class="unselectable mt-6" margin-right="mr-8" :tabs="walletTabs" v-model="currentTab"/>
        <QuipDivider class="mb-7"/>

        <transition mode="out-in" name="fade">
          <LdsSpinner class="d-flex align-center justify-center mx-auto flex-grow-1 spinnerSpace" v-if="metadata === null"/>
          <div v-else>
            <transition mode="out-in" name="fade">
              <WalletReceive v-if="currentTab === 'Receive'"/>
              <WalletSend v-else/>
            </transition>
          </div>
        </transition>
      </div>
    </QuipAnimatedCard>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

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
