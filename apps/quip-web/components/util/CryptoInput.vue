<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipButton from "~/components/util/QuipButton.vue";
import {Icon} from "@iconify/vue";
import {computed} from "vue";

const props = defineProps<{
  label: string,
  focused?: boolean,
  isUsd: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:isUsd', value: string): void
}>()

const { $crypto, $ticker } = useNuxtApp()

const colors = useTheme().current.value.colors
const isMoved = computed(() => computedModelValue.value.length > 0)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (props.focused) {
    inputRef.value?.focus()
  }
})

function trimCurrencyInput(value: string) {
  const indexOfPeriod = value.indexOf('.')

  if (internalIsUSDProp.value === 'USD') {
    //if input has more than 2 decimal places trim it
    if (indexOfPeriod !== -1 && value.length - indexOfPeriod > 3) {
      value = value.slice(0, indexOfPeriod + 3)
    }
  } else {
    //if input has more than 9 decimal places trim it
    if (indexOfPeriod !== -1 && value.length - indexOfPeriod > 10) {
      value = value.slice(0, indexOfPeriod + 10)
    }
  }

  return value
}

function solToUSD(sol: number) {
  return sol * $ticker.usdPrice.value
}

function usdToSol(usd: number) {
  return usd / $ticker.usdPrice.value
}

function swap() {
  // clear input
  if (internalIsUSDProp.value === 'USD') {
    //swapped to sol
    emits('update:isUsd', 'SOL')
    internalIsUSDProp.value = 'SOL'
    computedModelValue.value = usdToSol(Number(computedModelValue.value)).toFixed(9)
  } else {
    //swapped to usd
    emits('update:isUsd', 'USD')
    internalIsUSDProp.value = 'USD'
    computedModelValue.value = solToUSD(Number(computedModelValue.value)).toFixed(2)
  }
}

const internalIsUSDProp = ref(props.isUsd)
const modelValue = ref<string>("")

const computedModelValue = computed({
  get: () => {
    return trimCurrencyInput(modelValue.value.toString())
  },
  set: (value) => {
    const trimmed = trimCurrencyInput(value.toString())
    modelValue.value = trimmed

    if (inputRef.value) {
      inputRef.value.value = trimmed
    }

    emits('update:modelValue', trimmed === ''? 0 : parseFloat(trimmed))
  }
})

function onInput(value: string) {
  //filter out characters that are not numbers or periods
  value = value.replace(/[^0-9.]/g, '')
  //if a period is entered more than once, filter it out
  if (value.split('.').length > 2) {
    value = value.slice(0, value.length - 1)
  }

  computedModelValue.value = value
}

function maxValue() {
  if (internalIsUSDProp.value === 'USD') {
    if ($crypto && $ticker && $crypto.balance.value !== null) {
      computedModelValue.value = ($crypto.balance.value * $ticker.usdPrice.value).toFixed(2)
    }
  } else {
    if ($crypto && $crypto.balance.value !== null) {
      computedModelValue.value = $crypto.balance.value.toString()
    }
  }

  console.log(computedModelValue.value)
}
</script>

<template>
  <div class="quipInput rounded-pill position-relative d-flex align-center">
    <transition mode="out-in" name="fade-fast">
      <div :key="isUsd" class="currencyIcon position-absolute">
        <Icon class="currency text-secondary-grey no-pointer" :icon="isUsd === 'USD' ? 'fa:usd' : 'mingcute:solana-sol-fill'"/>
      </div>
    </transition>
    <div class="px-4 position-absolute no-pointer label">
      <div class="bg-white trans-all" :class="{'movedLabel': isMoved}">
        <transition mode="out-in" name="fade-fast">
          <h3 :key="label" class="px-2 text-secondary-grey">{{label}}</h3>
        </transition>
      </div>
    </div>
    <transition mode="out-in" name="fade-fast">
      <input
        :key="internalIsUSDProp"
        ref="inputRef"
        :class="isUsd === 'USD' ? 'pl-11 pr-6 text-secondary-grey co-headline' : 'pl-11 pr-6 text-secondary-grey co-headline'"
        :min="isUsd === 'USD' ? '0.01' : '0.000000001'"
        :step="isUsd === 'USD' ? '0.01' : '0.000000001'"
        type="text"
        :value="computedModelValue"
        @input="onInput($event.target.value)"
      >
    </transition>
    <div class="position-absolute no-pointer w-100 h-100 d-flex align-center justify-end z-20 btnHolder">
      <QuipButton @click="maxValue" class="bg-white pa-0 px-3 text-primary is-pointer mr-1" :height="32">
        <h3 class="text-primary currency">MAX</h3>
      </QuipButton>
      <QuipButton @click="swap" class="bg-primary pa-0 is-pointer switchBtn" :width="80" :height="32">
        <transition mode="out-in" name="fade-fast">
          <div :key="isUsd" class="d-flex align-center">
            <Icon :icon="isUsd === 'USD' ? 'fa:usd' : 'mingcute:solana-sol-fill'" class="mr-1 currency"/>
            <h3 class="bg-primary currency">
              {{isUsd}}
            </h3>
          </div>
        </transition>
      </QuipButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.quipInput {
  height: 48px;
  border: 1px solid v-bind("colors['border-grey']");
}

.switchBtn {
  margin-right: 5px;
}

input {
  width: 100%;
  height: 100%;
  outline: none;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.no-pointer {
  pointer-events: none;
}

.is-pointer {
  pointer-events: all;
}

h3 {
  transition: all 0.2s ease-out;
  font-size: 14px;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: 0.1px;
  color: v-bind("colors['text-secondary-grey']");
  background-color: white;
  border-radius: 9999px;
}

.trans-all {
  transition: all 0.2s ease-out;
}

.quipInput:focus-within {
  & > .label > div {
    transform: translateY(-24px);
  }

  & > .label > div > h3 {
    font-size: 12px;
    line-height: 14px;
  }
}

.movedLabel {
  transform: translateY(-24px);

  & > h3 {
    font-size: 12px;
    line-height: 14px;
  }
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.z-20 {
  z-index: 20;
}

.btnHolder {
  padding-right: 2px;
}

.currencyIcon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 20px;
}

.currency {
  font-size: 14px;
  letter-spacing: 1.1px;
}
</style>
