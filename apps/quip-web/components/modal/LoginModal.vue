<script setup lang="ts">
import QuipInput from "~/components/util/QuipInput.vue";
import QuipButton from "~/components/util/QuipButton.vue";
import {useAuth} from "~/store/AuthStore";
import {useModal} from "~/store/ModalStore";

const auth = useAuth()
const modal = useModal()

const email = ref("")

async function login() {
  modal.close()
  await auth.login(email.value)
}
</script>

<template>
  <Modal class="d-flex flex-column">
    <div class="h-100 w-100 d-flex flex-column flex-shrink-0 flex-grow-1 justify-space-around align-center">
      <div>
        <img draggable="false" class="logo unselectable" src="/mobileLogo.svg" alt="Quip Logo" />
      </div>
      <QuipInput v-model="email" class="w-100" label="Email Address" type="email"/>
      <QuipButton @click="login" class="login text-jetblack w-100">
        <h3>Login</h3>
      </QuipButton>
    </div>
  </Modal>
</template>

<style scoped lang="scss">

.row {
  height: 48px;
}

.login {
  border: solid 2px;
}

.logo {
  height: 48px;
}
</style>
