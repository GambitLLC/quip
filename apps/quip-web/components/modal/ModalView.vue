<script setup lang="ts">
import {useModal} from "~/store/ModalStore";
import AvatarCreatorModal from "~/components/modal/AvatarCreatorModal.vue";
import CloseAccountModal from "~/components/modal/CloseAccountModal.vue";
import LoginModal from "~/components/modal/LoginModal.vue";

const modal = useModal()
</script>

<template>
  <div class="w-100 h-100 position-fixed modalView" :class="{'open': modal.modal !== null}">
    <div class="safeArea d-flex align-center justify-center w-100 h-100">
      <transition name="fade-slide-up">
        <LoginModal v-if="modal.modal === 'Login'" title="Login"/>
        <AvatarCreatorModal v-else-if="modal.modal === 'AvatarCreator'" title="Avatar Creator" />
        <CloseAccountModal v-else-if="modal.modal === 'CloseAccount'" title="Close Account" />
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modalView {
  transition: opacity 0.3s ease-in-out;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  //background: linear-gradient(180deg, rgba(240, 249, 255, 0.8) 0%, rgba(255, 255, 255, .9) 134.69%);
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
}

.open {
  //dim background
  pointer-events: all;
  opacity: 1;
}
</style>
