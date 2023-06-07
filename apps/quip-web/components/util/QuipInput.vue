<script setup lang="ts">
import {useTheme} from "vuetify";

type Autocomplete =
  "off" | "on" | "name" | "honorific-prefix" | "given-name" | "additional-name" |
  "family-name" | "honorific-suffix" | "nickname" | "email" | "username" | "new-password" |
  "current-password" | "one-time-code" | "organization-title" | "organization" | "street-address" |
  "address-line1" | "address-line2" | "address-line3" | "address-level4" | "address-level3" | "address-level2" |
  "address-level1" | "country" | "country-name" | "postal-code" | "cc-name" | "cc-given-name" | "cc-additional-name" |
  "cc-family-name" | "cc-number" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "cc-csc" | "cc-type" | "transaction-currency" |
  "transaction-amount" | "language" | "bday" | "bday-day" | "bday-month" | "bday-year" | "sex" | "tel" | "tel-country-code" |
  "tel-national" | "tel-area-code" | "tel-local" | "tel-extension" | "impp" | "url" | "photo" | "webauthn"

const props = defineProps<{
  type: string,
  label: string,
  modelValue: string,
  focused?: boolean,
  autocomplete?: Autocomplete
}>()

const emits = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const colors = useTheme().current.value.colors
const isMoved = computed(() => props.modelValue.length > 0)

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (props.focused) {
    inputRef.value?.focus()
  }
})
</script>

<template>
  <div class="quipInput rounded-pill position-relative d-flex align-center">
    <div class="px-4 position-absolute no-pointer label"><h3 class="px-2 text-secondary-grey" :class="{'movedLabel': isMoved}">{{label}}</h3></div>
    <input v-if="autocomplete !== undefined" :autocomplete="autocomplete" :name="autocomplete === 'email' ? 'email' : undefined" ref="inputRef" :value="modelValue" @input="emits('update:modelValue', $event.target.value)" class=" px-6 text-secondary-grey co-headline rounded-pill" :type="type">
    <input v-else ref="inputRef" :value="modelValue" @input="emits('update:modelValue', $event.target.value)" class=" px-6 text-secondary-grey co-headline rounded-pill" :type="type">
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
</style>
