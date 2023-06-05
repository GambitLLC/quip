<script setup lang="ts">
import QuipButton from "~/components/util/QuipButton.vue";
import CryptoInput from "~/components/util/CryptoInput.vue";
import QuipInput from "~/components/util/QuipInput.vue";
import {useTheme} from "vuetify";

const colors = useTheme().current.value.colors
const { send } = useCrypto()

const transferType = ref<string>('SOL')
const solValue = ref<number>(0)
const addressInput = ref("")

function doSend() {
  send(addressInput.value, solValue.value)
}
</script>

<template>
  <div>
    <div>
      <h3 class="mb-5 subtext">
        Choose Amount
      </h3>
      <CryptoInput :label="`Amount (${transferType})`" @update:sol-value="value => solValue = value" v-model:is-usd="transferType"/>
    </div>
    <div class="mt-8">
      <h3 class="mb-4 subtext">
        Wallet Address
      </h3>
      <QuipInput v-model="addressInput" label="Solana Address" type="text"/>
    </div>
    <div class="w-100 d-flex mt-8">
      <QuipButton @click="doSend" :icon-size="18" :prepend-icon="false" icon="akar-icons:paper-airplane" class="bg-primary w-100">
        <h3 class="text-white">Send</h3>
      </QuipButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
h3 {
  color: v-bind("colors.jetblack");
}

.subtext {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  opacity: 0.4;
}
</style>
