<script setup lang="ts">
import {useModal} from "~/store/ModalStore";
import AvatarCreatorModal from "~/components/modal/AvatarCreatorModal.vue";
import CloseAccountModal from "~/components/modal/CloseAccountModal.vue";
import LoginModal from "~/components/modal/LoginModal.vue";

const modal = useModal()
</script>

<template>
  <div
    @wheel.prevent
    @touchmove.prevent
    @scroll.prevent
    @keydown.esc="modal.close()"
    class="w-100 h-100 position-fixed modalView"
    :class="{'open': modal.modal !== null}"
  >
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
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
}

.open {
  pointer-events: all;
  opacity: 1;
}
</style>
