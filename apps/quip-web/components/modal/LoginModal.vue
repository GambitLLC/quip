<script setup lang="ts">
import QuipInput from "~/components/util/QuipInput.vue";
import QuipButton from "~/components/util/QuipButton.vue";
import {useModal} from "~/store/ModalStore";
import OTPInput from "~/components/util/Otp/OTPInput.vue";
import {useTheme} from "vuetify";
import {Icon} from "@iconify/vue";
import {LoginEvent} from "~/utils/magic";

type LoginModalState = "login" | "otp" | "loading" | "error"

const router = useRouter()
const modal = useModal()
const colors = useTheme().current.value.colors

const { $login } = useNuxtApp()

const state = ref<LoginModalState>("login")
const loginEvent = ref<LoginEvent | null>(null)

const email = ref("")

function onSubmitOtp(otp: string) {
  loginEvent.value?.emit('verify-email-otp', otp);
  state.value = "loading"
}

function login() {
  loginEvent.value = $login(email.value)
  state.value = "loading"

  loginEvent.value
    ?.on('email-otp-sent', () => {
      state.value = "otp"
    })
    ?.on('invalid-email-otp', () => {
      console.log("invalid email otp")
      state.value = "error"
      loginEvent.value?.emit('cancel');
    })
    ?.on('done', (result) => {
      modal.close()
      router.push("/home")
    })
    ?.on('error', (error) => {
      state.value = "error"
    })
}
</script>

<template>
  <Modal @close="loginEvent?.emit('cancel')" class="d-flex flex-column modalBase">
    <transition name="fade" mode="out-in">
      <div v-if="state === 'login'" class="loginModal">
        <div>
          <img draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
        </div>
        <QuipInput :focused="true" @keydown.enter="login" v-model="email" class="w-100" label="Email Address" type="email"/>
        <QuipButton @click="login" class="login text-jetblack w-100">
          <h3>Login</h3>
        </QuipButton>
      </div>
      <div v-else-if="state === 'otp'" class="loginModal">
        <div>
<!--          <img draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />-->
          <Icon icon="icon-park-twotone:mail-unpacking" class="mailIcon"/>
        </div>
        <h3 class="mb-2 otpText text-secondary-grey">
          Please enter the 6-digit code sent to your email address
        </h3>
        <div class="">
          <OTPInput @otpDone="onSubmitOtp" class="" />
        </div>
      </div>
      <div v-else-if="state === 'loading'" class="loginModal">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div>
      <div v-else class="loginModal">
        <h3>Error</h3>
      </div>
    </transition>
  </Modal>
</template>

<style scoped lang="scss">

.modalBase {
  transition: all 0.3s ease-in-out;
}

.mailIcon {
  width: 58px;
  height: 58px;
  color: v-bind("colors['primary']");
}

.loginModal {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 1;
  justify-content: space-around;
  align-items: center;
}

.row {
  height: 48px;
}

.login {
  border: solid 2px;
}

.logo {
  height: 48px;
}

.otpText {
  max-width: 280px;
  text-align: center;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 15px;
}

//spinner
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid v-bind("colors['primary']");
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: v-bind("colors['primary']") transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
