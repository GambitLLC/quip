<script setup lang="ts">

import {range} from "~/util/iteration";
</script>

<template>
  <div class="title position-relative overflow-hidden unselectable">
    <div class="position-absolute titleInner">
      <div class="d-flex flex-row align-center w-100 h-100 titleOffsetTop">
        <div class="d-flex align-center" v-for="i in range(5)">
          <img class="candy1" src="/candy/candy1-white.svg" alt="faq candy">
          <h1 :class="{'outlineText': i % 2 === 1}">
            Frequently Asked Questions
          </h1>
        </div>
      </div>
      <div class="mt-6 d-flex flex-row align-center w-100 h-100 titleOffsetBottom">
        <div class="d-flex align-center" v-for="i in range(5)">
          <img class="candy1" src="/candy/candy1-white.svg" alt="faq candy">
          <h1 :class="{'outlineText': i % 2 === 0}">
            Frequently Asked Questions
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "styles/mixins.scss";

.title {
  height: 189px;
  width: 100%;

  @include sm-down {
    height: 84px;
  }
}

h1 {
  font-size: 80px;
  line-height: 100%;
  display: inline;

  margin-right: 24px;

  @include md-down {
    font-size: 56px;
    line-height: 60px;
    margin-right: 16px;
  }

  @include sm-down {
    font-size: 28px;
    line-height: 30px;
    margin-right: 12px;
  }
}

.candy1 {
  width: 37px;

  margin-right: 24px;

  @include md-down {
    width: 25px;
    margin-right: 16px;
  }

  @include sm-down {
    width: 18px;
    margin-right: 12px;
  }
}

.titleInner {
  width: 8000px;
  left: calc(50% - 4000px);

  @include md-down {
    width: 6000px;
    left: calc(50% - 3000px);
  }

  @include sm-down {
    width: 4000px;
    left: calc(50% - 2000px);
  }
}

.titleOffsetTop {
  margin-left: 200px;

  @include md-down {
    margin-left: 190px;
  }

  @include sm-down {
    margin-left: 178px;
  }
}

.titleOffsetBottom {
  margin-left: -200px;

  @include md-down {
    margin-left: 0px;
  }

  @include sm-down {
    margin-left: 225px;
  }
}
</style>
