<script setup lang="ts">
import {Icon} from '@iconify/vue';

</script>

<template>
  <div class="hero-wrapper d-flex marginBottom">
    <div class="hero-swirl">
      <img src="/landinghero/Vector 32.png">
    </div>
    <div class="hero-left">
      <div class="hero-title">
        Skill matters.
      </div>
      <div class="hero-description">
        Cryto e-sports. Real money Gaming. Competitive Experience.
      </div>
      <div class="hero-components d-flex pt-4">
        <QuipButton icon="material-symbols:download-rounded" class="bg-primary mr-8 mt-2">
          Download App
        </QuipButton>
        <div class="hero-reviews d-flex flex-column">
          <div class="hero-stars d-flex">
            <Icon class="icon-star" icon="material-symbols:star"/>
            <Icon class="icon-star" icon="material-symbols:star"/>
            <Icon class="icon-star" icon="material-symbols:star"/>
            <Icon class="icon-star" icon="material-symbols:star"/>
            <Icon class="icon-star" icon="material-symbols:star"/>
          </div>
          <div class="hero-review-text">
            5.0 / 124 reviews
          </div>
        </div>
      </div>
    </div>
    <div class="hero-right d-flex ml-auto mt-11">
      <div class="hero-profiles mr-2 mt-1 d-flex">
        <img class="hero-pro-icon" src="/landinghero/Sample.png">
        <img class="hero-pro-icon" src="/landinghero/Sample-1.png">
        <img class="hero-pro-icon" src="/landinghero/Sample-2.png">
        <img class="hero-pro-icon" src="/landinghero/Sample-3.png">
        <img class="hero-pro-icon mr-5" src="/landinghero/Sample-4.png">
      </div>
      <div class="hero-user-text d-flex flex-column">
        <div class="hero-user-top">
          +1.5K
        </div>
        <div class="hero-user-bottom">
          Users
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hero-wrapper {
  position: relative;
}

.hero-title {
  font-family: 'co-headline';
  font-style: normal;
  font-weight: 700;
  font-size: 124px;
  line-height: 145px;
  letter-spacing: 0.02em;

}

.hero-description {
  font-family: 'Lexend';
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  line-height: 30px;
}

.hero-swirl {
  position: absolute;
  left: 820px;
  top: 185px;
  //transform: matrix(0.6, -0.8, -0.8, -0.6, 0, 0);
}

.hero-review-text {
  font-family: 'Lexend';
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 18px;
  margin-top: 3px;
  margin-left: 3px;
}

.icon-star {
  color: #FFBB55;
  width: 34px;
  height: 34px;
}

.hero-pro-icon {
  width: 53;
  height: 53;
  margin: 0px -8px;
}

.hero-profiles {
  height: 57px;

}

.hero-user-text {
  margin-right: 2px;
}

.hero-user-top {
  font-family: 'Rubik', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  color: #14171F;
}

.hero-user-bottom {
  font-family: 'Rubik', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #6C6D71;

}

.marginBottom {
  margin-bottom: 78px;
}
</style>
