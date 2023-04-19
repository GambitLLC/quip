<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";

const {mobile, md, lgAndDown} = useDisplay()
const {colors} = useTheme().current.value

const computedDesktopCircles = computed(() => [
  {
    //circle 1
    circle: {
      size: md.value ? 400 : 573,
      top: md.value ? 'calc(50% - 200px)' : '10px',
      right: '-9px',
    },
    //img 1
    img: {
      src: '/ImageApp1.png',
      alt: 'quip app image',
      top: '-50px',
      left: '-30px',
      height: md.value ? '500px' : undefined,
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

onMounted(() => {
  console.log(useDisplay())
})
</script>

<template>
  <div
    class="bg-background bg w-100"
  >
    <Topbar/>
    <div
      class="pt-4 safeArea"
    >
      <div class="w-100 h-100 innerArea">
        <LandingHero/>
        <div v-if="!mobile" class="cards">
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
        <div class="w-100" v-else>
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
              width: '252px',
              bottom: '-17px',
              left: 'calc(50% - 136px)',
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
        <div class="w-100">
          <GameCard
            color="purple"
          >
          </GameCard>
          <GameCard
            color="green"
          >
          </GameCard>
          <GameCard
            color="blue"
          >
          </GameCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'styles/mixins.scss';

* {
  box-sizing: border-box;
}

html {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: v-bind('colors["background"]');
}

body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  background-color: v-bind('colors["background"]');
}

#__nuxt {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: v-bind('colors["background"]');
}

.bg {
  height: 10000px;
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

.innerArea {
  max-width: 1920px;
  margin: 0 auto;
}

.safeArea {
  @include sm-down {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }

  @include md {
    padding-left: 48px !important;
    padding-right: 48px !important;
  }

  @include lg {
    padding-left: 64px !important;
    padding-right: 64px !important;
  }

  @include xl {
    padding-left: 150px !important;
    padding-right: 150px !important;
  }

  @include xxl {
    padding-left: 300px !important;
    padding-right: 300px !important;
  }
}
</style>
