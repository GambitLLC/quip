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

const computedSize = computed(() => props.size)
const computedScale = computed(() => props.size / 295)

const AccessoryComponent = (props.accessory) ? defineAsyncComponent(() => import(`./playful_avatars/accessories/${props.accessory}.vue`)) : null
const HairComponent = (props.hair) ? defineAsyncComponent(() => import(`./playful_avatars/hair/${props.hair}.vue`)) : null

const EyeComponent = defineAsyncComponent(() => import(`./playful_avatars/eyes/${props.eye}.vue`))
const FaceComponent = defineAsyncComponent(() => import(`./playful_avatars/face/${props.face}.vue`))
const MouthComponent = defineAsyncComponent(() => import(`./playful_avatars/mouth/${props.mouth}.vue`))
const OutfitComponent = defineAsyncComponent(() => import(`./playful_avatars/outfit/${props.outfit}.vue`))
</script>

<template>
  <div :class="color" class="position-relative rounded-circle overflow-hidden d-flex align-center justify-center" :style="{width: `${computedSize}px`, height: `${computedSize}px`}">
    <AccessoryComponent :class="`accessory-${accessory}`" class="avatarComponent accessory"/>
    <EyeComponent class="avatarComponent eye"/>
    <FaceComponent class="avatarComponent face"/>
    <HairComponent :class="`hair-${hair}`" class="avatarComponent hair"/>
    <MouthComponent class="avatarComponent mouth"/>
    <OutfitComponent :class="`outfit-${outfit}`" class="avatarComponent outfit"/>
  </div>
</template>

<style scoped lang="scss">
@function scaleP($px_value) {
  @return calc(#{$px_value} / v-bind(computedSize) * v-bind(computedScale) * 100%);
}

.avatarComponent {
  position: absolute;
  transform: scale(v-bind('computedScale'));
  transform-origin: center;
}

.accessory {
  z-index: 3;
  margin-top: scaleP(35);
  margin-left: scaleP(22);
}

.eye {
  z-index: 1;
  margin-top: scaleP(-45);
  margin-left: scaleP(63);
}

.face {
  margin-top: scaleP(55);
  margin-left: scaleP(-25);
}

.hair {
  z-index: 2;
  margin-top: scaleP(-18);
  margin-left: scaleP(-3);
}

.mouth {
  z-index: 1;
  margin-top: scaleP(68);
  margin-left: scaleP(50);
}

.outfit {
  z-index: 1;
  margin-top: scaleP(263);
  margin-left: scaleP(15);
}

// -- custom hair offsets --
.hair-01 {
  margin-top: scaleP(-22);
  margin-left: scaleP(-3);
}

.hair-02 {
  margin-top: scaleP(-22);
  margin-left: scaleP(-3);
}

.hair-04 {
  margin-top: scaleP(-36);
  margin-left: scaleP(-3);
}

.hair-06 {
  margin-top: scaleP(-22);
  margin-left: scaleP(-3);
}

.hair-07 {
  margin-top: scaleP(-18);
  margin-left: scaleP(-5);
}

.hair-08 {
  margin-top: scaleP(-30);
  margin-left: scaleP(-3);
}

.hair-09 {
  margin-top: scaleP(-33);
  margin-left: scaleP(-3);
}

.hair-10 {
  margin-top: scaleP(-30);
  margin-left: scaleP(-3);
}

.hair-12 {
  margin-top: scaleP(-30);
  margin-left: scaleP(-3);
}

.hair-13 {
  margin-top: scaleP(-26);
  margin-left: scaleP(-3);
}

.hair-15 {
  margin-top: scaleP(-26);
  margin-left: scaleP(-3);
}

.hair-19 {
  margin-top: scaleP(-10);
  margin-left: scaleP(-3);
}

.hair-20 {
  margin-top: scaleP(20);
  margin-left: scaleP(-3);
}

.hair-22 {
  margin-top: scaleP(-30);
  margin-left: scaleP(-3);
}

.hair-23 {
  margin-top: scaleP(-10);
  margin-left: scaleP(-3);
}

// -- custom accessory offsets --
.accessory-Cap {
  margin-top: scaleP(-36);
  margin-left: scaleP(12);
}

.accessory-Circle_Earring {
  margin-top: scaleP(65);
  margin-left: scaleP(12);
}

.accessory-Earphone {
  margin-top: scaleP(177);
  margin-left: scaleP(18);
}

.accessory-Earring {
  margin-top: scaleP(64);
  margin-left: scaleP(18);
}

.accessory-Futuristic_Glasses {
  margin-top: scaleP(35);
  margin-left: scaleP(18);
}

.accessory-Glasses {
  margin-top: scaleP(45);
  margin-left: scaleP(18);
}

.accessory-Mask {
  margin-top: scaleP(60);
  margin-left: scaleP(18);
}

.accessory-Mask_Google {
  margin-top: scaleP(62);
  margin-left: scaleP(14);
}

.accessory-Moustache {
  margin-top: scaleP(68);
  margin-left: scaleP(18);
}

.accessory-Simple_Earring {
  margin-top: scaleP(64);
  margin-left: scaleP(18);
}

.accessory-Stylish_Glasses {
  margin-top: scaleP(44);
  margin-left: scaleP(14);
}

// -- custom outfit offsets --
.outfit-01 {
  margin-top: scaleP(257);
  margin-left: scaleP(11);
}

.outfit-08 {
  margin-top: scaleP(261);
  margin-left: scaleP(14);
}

.outfit-12 {
  margin-top: scaleP(263);
  margin-left: scaleP(14);
}

.outfit-13 {
  margin-top: scaleP(264);
  margin-left: scaleP(14);
}

.outfit-14 {
  margin-top: scaleP(264);
  margin-left: scaleP(10);
}

.outfit-15 {
  margin-top: scaleP(283);
  margin-left: scaleP(16);
}

.outfit-20 {
  margin-top: scaleP(263);
  margin-left: scaleP(15);
}
</style>
