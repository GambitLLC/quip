<script setup lang="ts">
import {useModal} from "~/store/ModalStore";
import AvatarCreatorModal from "~/components/modal/AvatarCreatorModal.vue";
import CloseAccountModal from "~/components/modal/CloseAccountModal.vue";
import Match from "~/components/util/Match.vue";

const modal = useModal()
</script>

<template>
  <div class="w-100 h-100 position-fixed modalView" :class="{'open': modal.modal !== null}">
    <div class="safeArea d-flex align-center justify-center w-100 h-100">
      <transition name="fade-slide-up">
        <AvatarCreatorModal v-if="modal.modal === 'AvatarCreator'" title="Avatar Creator" />
        <CloseAccountModal v-else-if="modal.modal === 'CloseAccount'" title="Close Account" />
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modalView {
  transition: background-color 0.3s ease-in-out;
  pointer-events: none;
  z-index: 1000;
}

.open {
  //dim background
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: all;
}
</style>
