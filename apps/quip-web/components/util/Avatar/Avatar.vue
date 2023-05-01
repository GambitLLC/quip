<script setup lang="ts">
import {Accessory, Eye, Face, Hair, Mouth, Outfit} from "~/components/util/Avatar/types";

const props = defineProps<{
  size: number,
  color: string,
  accessory?: Accessory
  eye: Eye,
  face: Face,
  hair?: Hair,
  mouth: Mouth,
  outfit: Outfit
}>()

const computedSize = computed(() => `${props.size}px`)

const AccessoryComponent = defineAsyncComponent(() => import(`./playful_avatars/accessories/${props.accessory}.vue`))
const EyeComponent = defineAsyncComponent(() => import(`./playful_avatars/eyes/${props.eye}.vue`))
const FaceComponent = defineAsyncComponent(() => import(`./playful_avatars/face/${props.face}.vue`))
const HairComponent = defineAsyncComponent(() => import(`./playful_avatars/hair/${props.hair}.vue`))
const MouthComponent = defineAsyncComponent(() => import(`./playful_avatars/mouth/${props.mouth}.vue`))
const OutfitComponent = defineAsyncComponent(() => import(`./playful_avatars/outfit/${props.outfit}.vue`))
</script>

<template>
  <div :class="color" class="position-relative rounded-circle overflow-hidden" :style="{width: computedSize, height: computedSize}">
    <AccessoryComponent class="avatarComponent accessory"/>
    <EyeComponent class="avatarComponent eye"/>
    <FaceComponent class="avatarComponent face"/>
    <HairComponent class="avatarComponent hair"/>
    <MouthComponent class="avatarComponent mouth"/>
    <OutfitComponent class="avatarComponent outfit"/>
  </div>
</template>

<style scoped lang="scss">
.avatarComponent {
  position: absolute;
}

.accessory {
  width: 606.67px;
  left: 29.8%;
  right: 23.53%;
  top: 47.3%;
  bottom: 23.37%;
}

.eye {
  width: 338px;
  left: 47.8%;
  right: 26.2%;
  top: 36.3%;
  bottom: 49.37%;
}

.face {
  width: 797.33px;
  left: 16.8%;
  right: 21.87%;
  top: 19.47%;
  bottom: -0.47%;
}

.hair {
  width: 1083.33px;
  left: 8.22%;
  right: 8.45%;
  top: 19.99%;
  bottom: 20.01%;
}

.mouth {
  width: 130px;
  left: 52.89%;
  right: 37.11%;
  top: 57.29%;
  bottom: 37.38%;
}

.outfit {
  width: 1256.67px;
  left: 4.47%;
  right: -1.13%;
  top: 62.97%;
  bottom: -26.3%;
}
</style>
