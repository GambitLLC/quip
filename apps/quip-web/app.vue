<script setup lang="ts">
import {useDisplay, useTheme} from "vuetify";
import QuipLandingHero from "~/components/QuipLandingHero.vue";
const {mobile} = useDisplay()
const {colors} = useTheme().current.value
</script>

<template>
  <div
    class="bg-background bg w-100"
  >
    <Topbar />
    <div
      class="pt-10 safeArea"
    >
      <QuipLandingHero/>
      <div class="cards">
        <div class="d-flex w-100 h-100">
          <div class="leftCards mr-8">
            <LandingHeroCard
              color="green"
              title="Play."
              text="Enjoy fun multiplayer physics-based games!"
              :circle="{
                size: 573,
                top: 29,
                right: -9,
              }"
              title-margin="mb-6"
              :text-max-width="250"
              :img="{
                src: '/ImageApp1.png',
                alt: 'quip app image',
                top: -35,
                left: -23,
                overflow: true,
              }"
              text-location="bottom"
            />
          </div>
          <div class="rightCards">
            <LandingHeroCard
              class="mb-6"
              color="purple"
              title="Earn."
              text="Earn real rewards and money when you play!"
              :circle="{
                size: 315,
                bottom: -93,
                right: -84,
              }"
              title-margin="mb-3"
              :text-max-width="171"
              :img="{
                src: '/ImageApp2.png',
                alt: 'quip app image',
                top: 33,
                left: 23,
                overflow: false,
              }"
              text-location="top"
            />
            <LandingHeroCard
              color="blue"
              title="Compete."
              text="Compete against your friends or the world, you decide."
              :circle="{
                size: 356,
                right: -125,
                bottom: -134,
              }"
              title-margin="mb-3"
              :text-max-width="150"
              :img="{
                src: '/ImageApp2.png',
                alt: 'quip app image',
                top: 29,
                left: 29,
                overflow: false,
              }"
              text-location="top"
            />
          </div>
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
}

body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

#__nuxt {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

.bg {
  height: 10000px;
}

.cards {
  height: 611px;
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

.safeArea {
  @include sm-down {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }

  @include md {
    padding-left: 32px !important;
    padding-right: 32px !important;
  }

  @include lg {
    padding-left: 64px !important;
    padding-right: 64px !important;
  }

  @include xl {
    padding-left: 150px !important;
    padding-right: 150px !important;
  }
}
</style>
