<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";

import LandingHero from "~/components/landing/LandingHero.vue";
import LandingHeroCard from "~/components/landing/LandingHeroCard.vue"
import GameCard from "~/components/landing/GameCard.vue"
import FrequentlyAskedQuestions from "~/components/landing/FrequentlyAskedQuestions.vue";
import {useTopbar} from "~/store/TopbarStore";
import Topbar from "~/components/util/Topbar/Topbar.vue";

const {mobile, md, lgAndDown} = useDisplay()
const {colors} = useTheme().current.value

const computedDesktopCircles = computed(() => [
  {
    //circle 1
    circle: {
      size: md.value ? 360 : 573,
      top: md.value ? 'calc(50% - 200px)' : '10px',
      right: '-9px',
    },
    //img 1
    img: {
      src: '/ImageApp1.png',
      alt: 'quip app image',
      top: md.value ? '-30px' : '-70px',
      left: md.value ? '-40px' : '-80px',
      height: md.value ? '420px' : undefined,
      overflow: !md.value,
    }
  },
  {
    //circle 2
    circle: {
      size: md.value ? 270 : 315,
      bottom: '-93px',
      right: '-84px',
    },
    //img 2
    img: {
      src: '/ImageApp2.png',
      alt: 'quip app image',
      top: md.value ? '28px' : '33px',
      left: md.value ? '18px' : '23px',
      height: md.value ? '150px' : undefined,
      overflow: false,
    }
  },
  {
    //circle 3
    circle: {
      size: md.value ? 270 : 315,
      bottom: '-93px',
      right: '-84px',
    },
    //img 3
    img: {
      src: '/ImageApp2.png',
      alt: 'quip app image',
      top: md.value ? '28px' : '33px',
      left: md.value ? '18px' : '23px',
      height: md.value ? '150px' : undefined,
      overflow: false,
    }
  }
])

const homeRef = ref<HTMLElement | null>(null)
const aboutRef = ref<HTMLElement | null>(null)
const gamesRef = ref<HTMLElement | null>(null)
const faqRef = ref<HTMLElement | null>(null)

const topbar = useTopbar()

watch(homeRef,  (value) => { topbar.homeRef  = value })
watch(aboutRef, (value) => { topbar.aboutRef = value })
watch(gamesRef, (value) => { topbar.gamesRef = value })
watch(faqRef,   (value) => { topbar.faqRef   = value })
</script>

<template>
  <div
    class="bg-background w-100"
  >
    <ClientOnly>
      <Topbar/>
    </ClientOnly>
    <div
      class="pt-4 safeArea"
    >
      <div class="w-100 h-100 innerArea">
        <div ref="homeRef">
          <LandingHero/>
        </div>
        <div ref="aboutRef" v-if="!mobile" class="cards">
          <div class="d-flex w-100 h-100">
            <div class="leftCards" :class="{
            'mr-16': !lgAndDown,
            'mr-8': lgAndDown,
          }">
              <LandingHeroCard
                color="green"
                title="Play."
                text="Enjoy fun multiplayer physics-based games!"
                :circle="computedDesktopCircles[0].circle"
                title-margin="mb-6"
                :text-max-width="250"
                :img="computedDesktopCircles[0].img"
                text-location="bottom"
              />
            </div>
            <div class="rightCards">
              <LandingHeroCard
                class="mb-6"
                color="purple"
                title="Earn."
                text="Earn real rewards and money when you play!"
                :circle="computedDesktopCircles[1].circle"
                title-margin="mb-3"
                :text-max-width="171"
                :img="computedDesktopCircles[1].img"
                text-location="top"
              />
              <LandingHeroCard
                color="blue"
                title="Compete."
                text="Compete against your friends or the world, you decide."
                :circle="computedDesktopCircles[2].circle"
                title-margin="mb-3"
                :text-max-width="150"
                :img="computedDesktopCircles[2].img"
                text-location="top"
              />
            </div>
          </div>
        </div>
        <div ref="aboutRef" class="w-100" v-else>
          <LandingHeroCard
            class="mb-4"
            :style="{height: '498px !important'}"
            color="green"
            title="Play."
            text="Enjoy fun multiplayer physics-based games!"
            :circle="{
              size: 256,
              bottom: '43px',
              left: 'calc(50% - 128px)',
            }"
            title-margin="mb-2"
            :text-max-width="190"
            :img="{
              src: '/ImageApp1.png',
              width: '320px',
              bottom: '-35px',
              left: 'calc(50% - 175px)',
              alt: 'quip app image',
              overflow: false,
            }"
            text-location="top"
          />
          <LandingHeroCard
            class="mb-4"
            :style="{height: '293px !important'}"
            color="purple"
            title="Earn."
            text="Earn real rewards and money when you play!"
            :circle="{
              size: 256,
              bottom: '-86px',
              right: '-64px'
            }"
            title-margin="mb-2"
            :text-max-width="190"
            :img="{
              src: '/ImageApp2.png',
              height: '150px',
              top: '15px',
              left: '15px',
              alt: 'quip app image',
              overflow: false,
            }"
            text-location="top"
          />
          <LandingHeroCard
            :style="{height: '293px !important'}"
            color="blue"
            title="Compete."
            text="Compete against your friends or the world, you decide."
            :circle="{
              size: 256,
              bottom: '-86px',
              right: '-64px'
            }"
            title-margin="mb-2"
            :text-max-width="190"
            :img="{
              src: '/ImageApp2.png',
              height: '150px',
              top: '15px',
              left: '15px',
              alt: 'quip app image',
              overflow: false,
            }"
            text-location="top"
          />
        </div>
        <div ref="gamesRef" class="w-100 marginTopGameCards">
          <GameCard
            color="purple"
            layout="right"
            title="Quip: Race"
            text="Enjoy fun physics-based games from your favorite creators."
            :bullets="[
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
            ]"
            img="/game/gameCardImg1.png"
          >
          </GameCard>
          <GameCard
            color="green"
            layout="left"
            title="Quip: Shoot"
            text="Enjoy fun physics-based games from your favorite creators."
            :bullets="[
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
            ]"
            img="/game/gameCardImg2.png"
            :coming-soon="true"
          >
          </GameCard>
          <GameCard
            color="blue"
            layout="right"
            title="Quip: Think"
            text="Enjoy fun physics-based games from your favorite creators."
            :bullets="[
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
              'Lorem Ipsum Dolor Met',
            ]"
            :coming-soon="true"
            img="/game/gameCardImg3.png"
          >
          </GameCard>
        </div>
      </div>
    </div>
    <div ref="faqRef" class="faqMargin">
      <FrequentlyAskedQuestions/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.marginTopGameCards {
  margin-top: 72px;

  @include sm-down {
    margin-top: 16px;
  }
}

.cards {
  height: 570px;
  width: 100%;
}

.leftCards {
  /*make left cards take up 2/3rds of the space using flex*/
  display: flex;
  flex-direction: column;

  flex: 2 1 auto;
}

.rightCards {
  /*make right cards take up 1/3rd of the space*/
  display: flex;
  flex-direction: column;

  flex: 1 1 auto;
}

.faqMargin {
  margin-top: 70px;

  @include sm-down {
    margin-top: 56px;
  }
}
</style>
