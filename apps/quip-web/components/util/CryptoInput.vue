<script setup lang="ts">
import {useTheme} from "vuetify";
import QuipButton from "~/components/util/QuipButton.vue";
import {Icon} from "@iconify/vue";

const props = defineProps<{
  type: string,
  label: string,
  modelValue: string,
  focused?: boolean,
  isUSD: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:isUSD', value: string): void
}>()

const colors = useTheme().current.value.colors
const isMoved = computed(() => props.modelValue.length > 0)

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (props.focused) {
    inputRef.value?.focus()
  }
})

function swap() {
  if (props.isUSD === 'USD') {
    emits('update:isUSD', 'SOL')
  } else {
    emits('update:isUSD', 'USD')
  }
}
</script>

<template>
  <div class="quipInput rounded-pill position-relative d-flex align-center">
    <div class="px-4 position-absolute no-pointer label">
      <transition mode="out-in" name="fade-fast">
        <h3 :key="label" class="px-2 text-secondary-grey" :class="{'movedLabel': isMoved}">{{label}}</h3>
      </transition>
    </div>
    <input ref="inputRef" :value="modelValue" @input="emits('update:modelValue', $event.target.value)" class=" px-6 text-secondary-grey co-headline" :type="type">
    <div class="position-absolute no-pointer w-100 h-100 d-flex align-center justify-end z-20 btnHolder">
      <QuipButton @click="swap" class="bg-primary pa-0 is-pointer" :width="80">
        <transition mode="out-in" name="fade-fast">
          <div :key="isUSD" class="d-flex align-center">
            <Icon :icon="isUSD === 'USD' ? 'fa:usd' : 'mingcute:solana-sol-fill'" class="mr-1 currency"/>
            <h3 class="bg-primary currency">
              {{isUSD}}
            </h3>
          </div>
        </transition>
      </QuipButton>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.quipInput {
  height: 48px;
  border: 1px solid v-bind("colors['border-grey']");
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

.quipInput:focus-within {
  & > .label > h3 {
    transform: translateY(-24px);
    font-size: 12px;
    line-height: 14px;
  }
}

.movedLabel {
  transform: translateY(-24px);
  font-size: 12px;
  line-height: 14px;
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
  font-size: 16px;
  letter-spacing: 1.2px;
}
</style>
