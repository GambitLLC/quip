<script setup lang="ts">
import QRCodeStyling from "qr-code-styling";
import {useTheme} from "vuetify";

const props = defineProps<{
  data: string,
  size: number
}>()

const qrCodeRef = ref<HTMLElement | null>(null)

const colors = useTheme().current.value.colors

onMounted(() => {
  import('qr-code-styling').then(({ default: QRCodeStyling }) => {
    if (!qrCodeRef.value) return

    const qrCode = new QRCodeStyling({
      width: props.size,
      height: props.size,
      type: "svg",
      data: props.data,
      dotsOptions: {
        color: colors.primary,
        type: "rounded"
      },
      backgroundOptions: {
        color: colors.white,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 20
      }
    });
    qrCode.append(qrCodeRef.value);
  });
})

</script>

<template>
 <div ref="qrCodeRef"/>
</template>

<style scoped lang="scss">

</style>
