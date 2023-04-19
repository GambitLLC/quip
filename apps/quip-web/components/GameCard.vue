<script setup lang="ts">
import {useWindowSize} from "@vueuse/core";
import {range} from "~/util/iteration";
import {useTheme} from "vuetify";

const props = defineProps<{
  color: "green" | "purple" | "blue",
  layout: "left" | "right",
  title: string,
  text: string,
  bullets: string[],
  comingSoon?: boolean,
  img: string,
}>()

const {colors} = useTheme().current.value

const computedColor = computed(() => `bg-${props.color}-light`)
const computedColorAccent = computed(() => `bg-${props.color}-dark`)

const computedBulletColor = computed(() => `bg-${props.color}-bullet`)
const computedBulletColorAccent = computed(() => `bg-${props.color}-bullet-accent`)

const computedColorOutline = computed(() => colors[`${props.color}-light`])

function calcCardRot() {
  //calculate the height and width of the card and set a css variable
  const card = document.querySelector('.gameCard')
  const cardWidth = card?.clientWidth
  const cardHeight = card?.clientHeight

  if (cardWidth && cardHeight) {
    const bannerRot = Math.atan2(cardHeight, cardWidth) * (180 / Math.PI)
    document.documentElement.style.setProperty('--bannerRot', `${bannerRot}deg`)
  }
}

onBeforeMount(calcCardRot)
const { width, height } = useWindowSize()
watch(width, calcCardRot)
watch(height, calcCardRot)
</script>

<template>
  <QuipCard :class="computedColor" class="gameCard mb-8 overflow-hidden">
    <div
      :class="{
        'flex-row': props.layout === 'right',
        'flex-row-reverse': props.layout === 'left',
      }"
      class="d-flex w-100 h-100 position-relative"
    >
      <div v-if="comingSoon" class="comingSoon position-absolute h-100 w-100 rounded-corners overflow-hidden">
        <div class="w-100 h-100 rotate d-flex align-center justify-center">
          <div class="banner elevation-24 d-flex align-center justify-center ml-16" :class="computedColor">
            <div v-for="i in range(7)">
              <h1 class="text-jetblack-light mr-6 d-inline outlineText" v-if="i % 2 === 1">
                Coming Soon
              </h1>
              <h1 v-else class="d-inline mr-6 comingSoonText text-jetblack-light">
                {{ title }}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex w-100 h-100 align-center pa-16" :class="{'blur': comingSoon}">
        <div class="w-100 h-100 d-flex align-center justify-center">
          <div class="circle position-relative" :class="computedColorAccent">
            <img :src="img" alt="quip game image" class="position-absolute gameImg"/>
          </div>
        </div>
        <div class="w-100">
          <h1 class="text-jetblack-light mb-6">
            {{ title }}
          </h1>
          <p>
            {{ text }}
          </p>
          <div class="mt-10">
            <div v-for="(bullet, i) in bullets" :key="i" class="d-flex align-center mb-8">
              <div class="bullet" :class="computedBulletColor">
                <div class="bulletCircle" :class="computedBulletColorAccent"/>
              </div>
              <div class="bulletText co-headline text-jetblack-light ml-6">
                {{ bullet }}
              </div>
            </div>
          </div>
          <div class="learnMore">
            <QuipButton :width="176" class="learnMoreBtn text-jetblack">
              <h3>Learn More</h3>
            </QuipButton>
          </div>
        </div>
      </div>
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
.gameCard {
  height: calc(100vh - 160px);
}

h1 {
  font-size: 80px;
  line-height: 80px;
}

p {
  max-width: 450px;
  font-weight: 300;
  font-size: 24px;
  line-height: 30px;
}

.learnMore {
  height: 48px;
  display: flex;
  align-items: center;
}

.learnMoreBtn {
  border: solid 2px;
}

.bullet {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulletCircle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.bulletText {
  font-weight: 400;
  font-size: 18px;
  line-height: 20px;
}

.comingSoon {
  z-index: 10;
  width: 100%;
  flex-shrink: 0;
}

.comingSoonText {
  font-weight: 700;
  font-size: 48px;
  line-height: 100%;
}

.outlineText {
  font-weight: 700;
  font-size: 48px;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
  color: v-bind('computedColorOutline') !important;
}

/* Real outline for modern browsers */
@supports((text-stroke: 2px black) or (-webkit-text-stroke: 2px black)) {
  .outlineText {
    color: transparent;
    -webkit-text-stroke: 2px black;
    text-stroke: 2px black;
    text-shadow: none;
  }
}

.blur {
  filter: blur(16px);
}

.rotate {
  transform: rotate(var(--bannerRot));
  transform-origin: center center;
}

.banner {
  width: max(200vw, 4000px);
  height: 104px;
  flex-shrink: 0;
}

.centerDiv {
  width: 32px;
  height: 32px;
  z-index: 200;
}

.circle {
  width: 480px;
  height: 480px;
  border-radius: 50%;
}

.gameImg {
  top: calc(50% - 260px);
  left: calc(50% - 290px);
  height: 620px;
}
</style>
