<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipButton from "~/components/util/QuipButton.vue";
import {Icon} from "@iconify/vue";

const props = defineProps<{
  label: string,
  focused?: boolean,
  isUsd: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:isUsd', value: string): void
}>()

const colors = useTheme().current.value.colors
const isMoved = computed(() => modelValue.value.length > 0)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (props.focused) {
    inputRef.value?.focus()
  }
})

function swap() {
  // clear input
  modelValue.value = ''

  if (props.isUsd === 'USD') {
    emits('update:isUsd', 'SOL')
  } else {
    emits('update:isUsd', 'USD')
  }
}


const modelValue = ref<string>("")

watch(modelValue, (newValue) => {
  emits('update:modelValue', newValue === ''? 0 : parseFloat(newValue))
})

function onInput(value: string) {
  if (!inputRef.value) return

  if (props.isUsd === 'USD') {
    //if input has more than 2 decimal places, set value to previous value
    const indexOfPeriod = value.indexOf('.')
    if (indexOfPeriod !== -1 && value.length - indexOfPeriod > 3) {
      inputRef.value.value = inputRef.value.value.slice(0, -1)
      return
    }

    modelValue.value = value
  } else {
    //if input has more than 9 decimal places, set value to previous value
    const indexOfPeriod = value.indexOf('.')
    if (indexOfPeriod !== -1 && value.length - indexOfPeriod > 10) {
      inputRef.value.value = inputRef.value.value.slice(0, -1)
      return
    }

    modelValue.value = value
  }
}
</script>

<template>
  <div class="quipInput rounded-pill position-relative d-flex align-center">
    <transition mode="out-in" name="fade-fast">
      <Icon :key="isUsd" class="ml-6 currency text-secondary-grey position-absolute no-pointer" :icon="isUsd === 'USD' ? 'fa:usd' : 'mingcute:solana-sol-fill'"/>
    </transition>
    <div class="px-4 position-absolute no-pointer label">
      <div class="bg-white trans-all" :class="{'movedLabel': isMoved}">
        <transition mode="out-in" name="fade-fast">
          <h3 :key="label" class="px-2 text-secondary-grey">{{label}}</h3>
        </transition>
      </div>
    </div>
    <input
      v-if="isUsd === 'USD'"
      ref="inputRef"
      class=" pl-9 pr-6 text-secondary-grey co-headline"
      min="0.01" step="0.01"
      type="number"
      @input="onInput($event.target.value)"
    >
    <input
      v-else
      ref="inputRef"
      class=" pl-11 pr-6 text-secondary-grey co-headline"
      min="0.000000001" step="0.000000001"
      type="number"
      @input="onInput($event.target.value)"
    >
    <div class="position-absolute no-pointer w-100 h-100 d-flex align-center justify-end z-20 btnHolder">
      <QuipButton @click="swap" class="bg-primary pa-0 is-pointer switchBtn" :width="80" :height="38">
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
  margin-right: 2px;
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

.currency {
  font-size: 14px;
  letter-spacing: 1.1px;
}
</style>
