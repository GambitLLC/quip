<script setup lang="ts">

import {useTheme} from "vuetify";

const emits = defineEmits<{ (e: 'otpDone', value: string): void}>()

const colors = useTheme().current.value.colors

const inputRefs = ref<
  [
    Ref<HTMLInputElement | null>,
    Ref<HTMLInputElement | null>,
    Ref<HTMLInputElement | null>,
    Ref<HTMLInputElement | null>,
    Ref<HTMLInputElement | null>,
    Ref<HTMLInputElement | null>
  ]
>([
  ref(null),
  ref(null),
  ref(null),
  ref(null),
  ref(null),
  ref(null),
])

const computedOtp = () => {
  return inputRefs.value.reduce((acc, curr) => {
    if (curr.value) {
      //@ts-ignore
      acc += curr.value[0].value
    }
    return acc
  }, '')
}

function onDelete(event: InputEvent, digit: string, index: number) {
  digit = digit ?? '';

  if (digit.length === 0 && index > 0) {
    //@ts-ignore
    inputRefs.value[index - 1].value[0]?.focus()
  }
}

function onDigit(target: HTMLInputElement, digit: string, index: number) {
  digit = digit ?? '';

  target.value = digit

  //focus next input
  if (digit.length > 0 && index < 5) {
    //@ts-ignore
    inputRefs.value[index + 1].value[0]?.focus()
  }

  //emit value
  if (computedOtp().length === 6) {
    setTimeout(() => {
      emits('otpDone', computedOtp())
    }, 400)
  }
}

function onPaste(event: ClipboardEvent) {
  const paste = event.clipboardData?.getData('text/plain')
  if (paste) {
    const digits = paste.split('')
    event.stopPropagation()
    event.preventDefault()
    event.stopImmediatePropagation()

    for (let i = 0; i < digits.length; i++) {
      //@ts-ignore
      onDigit(inputRefs.value[i].value[0], digits[i], i)
    }
  }
}

//initial input focus
onMounted(() => {
  //@ts-ignore
  inputRefs.value[0].value[0]?.focus()
})
</script>

<template>
  <div class="otp" @paste="onPaste">
    <input
      :ref="inputRefs[i]"
      v-for="i in range(6)"
      @input="onDigit($event.target, $event.data, i)"
      @keydown.delete="onDelete($event, $event.data, i)"
      inputmode="numeric"
      type="number"
      autocomplete="one-time-code"
      minlength="1"
      class="co-headline"
      :class="{'mr-3': i < 5}"
    >
  </div>
</template>

<style scoped lang="scss">
.otp {
  display: flex;
  height: 48px;
  justify-content: space-between;
}

input {
  transition: border-color 0.3s ease-in-out;
  width: 38px;
  border-radius: 10px;
  border: 1px solid v-bind("colors['border-grey']");
  text-align: center;
  color: transparent;
  text-shadow: 0 0 0 v-bind("colors['jetblack']");
  font-size: 20px;
  font-weight: 500;
}

input:focus {
  outline: none;
  border: 2px solid v-bind("colors['primary']");
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
