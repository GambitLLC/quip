<script setup lang="ts">
import {Icon} from '@iconify/vue';
import {range} from "~/util/iteration";
import {useDisplay} from "vuetify";

const display = useDisplay();
</script>

<template>
  <div class="hero-wrapper">
    <div class="hero-first mr-8">
      <h1 class="hero-title text-jetblack">Skill Matters.</h1>
      <p class="hero-description text-jetblack">Crypto e-sports. Real money gaming. Competitive Experience.</p>
      <div class="hero-components">
        <QuipButton :width="211" icon="material-symbols:download-rounded" class="bg-primary hero-dl-button">
          Download App
        </QuipButton>
        <div>
          <div class="d-flex flex-row">
            <Icon :key="i" v-for="i in range(5)" class="icon-star text-gold" icon="material-symbols:star-rounded"/>
          </div>
          <p class="hero-review-text text-jetblack">
            5.0 / 124 reviews
          </p>
        </div>
      </div>
    </div>
    <div class="hero-second position-relative">
      <img class="hero-swirl" src="/landinghero/Vector-32.svg" alt="swirl">
      <div class="pr-4">
        <img
          draggable="false"
          :key="i"
          v-for="i in range(4)"
          class="hero-avatar-icon unselectable"
          :src="`/landinghero/Sample-${i}.png`"
          :alt="`Avatar ${i}`"
        >
      </div>
      <div class="d-flex flex-column ml-5">
        <h3 class="hero-user-top text-jetblack">
          +1.5K
        </h3>
        <p class="hero-user-bottom text-grey-dark">
          Users
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import 'styles/mixins.scss';

.hero-wrapper {
  display: flex;
  flex-direction: row;
  margin-bottom: 64px;
  width: 100%;

  @include sm-down {
    flex-direction: column;
    margin-bottom: 40px;
  }
}

.hero-first {
  display: flex;
  flex-direction: column;
  flex: 2 1 0;
}

.hero-second {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex: 1 1 0;
  justify-content: flex-end;

  @include md-down {
    margin-top: 5px;
  }

  @include sm-down {
    margin-left: 0;
    margin-top: 32px;
    justify-content: flex-start;
  }
}

.hero-components {
  display: flex;
  flex-direction: row;
  align-items: center;

  @include sm-down {
    align-items: start;
    flex-direction: column;
  }
}

.hero-dl-button {
  margin-right: 32px;

  @include sm-down {
    margin-bottom: 8px;
  }
}

.hero-title {
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 80px;
  line-height: 100px;

  @include lg-down {
    font-size: 60px;
    line-height: 70px;
  }

  @include md-down {
    font-size: 50px;
    line-height: 70px;
  }

  @include sm-down {
    font-size: 40px;
    line-height: 47px;
    margin-bottom: 8px;
  }
}

.hero-description {
  font-weight: 300;
  font-size: 20px;
  line-height: 28px;

  margin-bottom: 16px;

  @include sm-down {
    font-size: 18px;
    line-height: 22px;
    margin-bottom: 24px;
  }
}

.hero-swirl {
  position: absolute;
  top: 70px;
  right: 100px;

  rotate: 20deg;

  @include sm-down {
    left: 220px;
    top: -120px;
    rotate: 0deg;
    width: 95.12px;
    height: 59.02px;
  }
}

.hero-review-text {
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  margin-top: 3px;
  margin-left: 5px;

  @include sm-down {
    padding-left: 4px;
    font-size: 14px;
    line-height: 18px;
  }
}

.icon-star {
  width: 34px;
  height: 34px;
}

.hero-avatar-icon {
  width: 64px;
  height: 64px;
  margin-right: -16px;
  image-rendering: crisp-edges;
}

.hero-user-top {
  font-family: 'Rubik', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
}

.hero-user-bottom {
  font-family: 'Rubik', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
}
</style>
