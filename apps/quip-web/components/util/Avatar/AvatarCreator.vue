<script setup lang="ts">
import Avatar from "~/components/util/Avatar/Avatar.vue";
import {Accessory, Eye, Face, Mouth, Hair, Outfit, accessories, eyes, faces, mouths, hairs, outfits} from "~/components/util/Avatar/types";
import SliderSelector from "~/components/util/Avatar/SliderSelector.vue";
import {capitalize} from "~/util/text";

const colors = ["green", "purple", "blue"] as const
type Color = typeof colors[number]

const picker = reactive({
  eyeIndex: 3,
  faceIndex: 2,
  mouthIndex: 4,
  outfitIndex: 0,
  accessoryIndex: 2,
  hairIndex: 3,
  colorIndex: 0,
})

function circ(i: number, n: number) {
  return (i % n + n) % n
}

const eye = computed<Eye>(() => eyes[circ(picker.eyeIndex, eyes.length)])
const face = computed<Face>(() => faces[circ(picker.faceIndex, faces.length)])
const mouth = computed<Mouth>(() => mouths[circ(picker.mouthIndex, mouths.length)])
const outfit = computed<Outfit>(() => outfits[circ(picker.outfitIndex, outfits.length)])
const accessory = computed<Accessory>(() => accessories[circ(picker.accessoryIndex, accessories.length)])
const hair = computed<Hair>(() => hairs[circ(picker.hairIndex, hairs.length)])
const color = computed<Color>(() => colors[circ(picker.colorIndex, colors.length)])
const computedColor = computed(() => `bg-${color.value}-dark`)
</script>

<template>
  <div class="bg-white rounded-corners creator pa-6 unselectable">
    <Avatar
      class="flex-shrink-0"
      :size="250"
      :eye="eye"
      :face="face"
      :mouth="mouth"
      :outfit="outfit"
      :accessory="accessory"
      :hair="hair"
      :color="computedColor"
    />
    <div class="mt-4 w-100 h-100 d-flex flex-column align-center">
      <div>
        <SliderSelector class="pb-2" @left="picker.faceIndex--" @right="picker.faceIndex++">
          <h3>
            {{face}} Face
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.hairIndex--" @right="picker.hairIndex++">
          <h3>
            Hair {{hair}}
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.eyeIndex--" @right="picker.eyeIndex++">
          <h3>
            {{eye}} Eyes
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.mouthIndex--" @right="picker.mouthIndex++">
          <h3>
            {{mouth.split('_').join(" ")}}
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.outfitIndex--" @right="picker.outfitIndex++">
          <h3>
            Outfit {{outfit}}
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.accessoryIndex--" @right="picker.accessoryIndex++">
          <h3>
            {{accessory}}
          </h3>
        </SliderSelector>
      </div>
      <div>
        <SliderSelector class="pb-2" @left="picker.colorIndex--" @right="picker.colorIndex++">
          <h3>
            {{capitalize(color)}}
          </h3>
        </SliderSelector>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.creator {
  width: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

h3 {
  text-align: center;
}
</style>
