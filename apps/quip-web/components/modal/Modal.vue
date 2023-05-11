<script setup lang="ts">
import {useModal} from "~/store/ModalStore";
import {useDisplay, useTheme} from "vuetify";
import {Icon} from "@iconify/vue";
import {vOnClickOutside} from "@vueuse/components";

const props = defineProps<{
  title?: string,
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const {mobile} = useDisplay()

const modal = useModal()
const colors = useTheme().current.value.colors
const grey = ref(colors["border-grey"])
</script>

<template>
  <div v-on-click-outside="() => {emits('close'); modal.close()}" class="bg-white modal" :class="{'pa-4': mobile, 'pa-6': !mobile}">
    <div class="d-flex align-center w-100 modalHeader mb-4">
      <h3 class="text-jetblack">
        {{title}}
      </h3>
      <div class="flex-grow-1"/>
      <div v-ripple @click="emits('close'); modal.close()" class="closeIcon">
        <Icon icon="material-symbols:close-rounded"/>
      </div>
    </div>
    <slot/>
  </div>
</template>

<style scoped lang="scss">
$headerSize: 28px;

.modal {
  border-radius: 24px;
  //border: 2px solid v-bind(grey);
  min-width: 300px;
  min-height: 400px;
  pointer-events: all;
  box-shadow: 0 12px 56px rgba(119,118,122,.15);
}

.modalHeader {
  height: $headerSize;
}

.closeIcon {
  height: $headerSize;
  width: $headerSize;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  font-size: 24px;
}
</style>
