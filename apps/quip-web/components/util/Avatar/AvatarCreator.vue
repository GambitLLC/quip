<script setup lang="ts">
import Avatar from "~/components/util/Avatar/Avatar.vue";
import SliderSelector from "~/components/util/Avatar/SliderSelector.vue";
import {
  Accessory,
  Eye,
  Face,
  Mouth,
  Hair,
  Outfit,
  Color,
  accessories,
  eyes,
  faces,
  mouths,
  hairs,
  outfits,
  colors
} from "~/components/util/Avatar/types";
import {capitalize} from "~/util/text";
import {useDisplay} from "vuetify";

const { mobile } = useDisplay()

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
</script>

<template>
  <div class="bg-white rounded-corners creator unselectable" :class="{'pa-4': mobile, 'pa-6': !mobile}">
    <Avatar
      class="flex-shrink-0"
      :size="mobile ? 180 : 250"
      :eye="eye"
      :face="face"
      :mouth="mouth"
      :outfit="outfit"
      :accessory="accessory"
      :hair="hair"
      :color="color"
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
            {{accessory.split('_').join(" ")}}
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
@import "styles/mixins.scss";
.creator {
  width: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;

  @include sm-down {
    width: 300px;
  }
}

h3 {
  text-align: center;

  @include sm-down {
    font-size: 16px;
  }
}
</style>
