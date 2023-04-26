<script setup lang="ts">
import QuipButton from "~/components/util/QuipButton.vue"

import {useScroll} from "~/util/scroll";
import {useTheme} from "vuetify";

const { isScrolled } = useScroll()
const {colors} = useTheme().current.value
</script>

<template>
  <div class="topbarBase safeArea" :class="{'topbarBaseScrolled': isScrolled}">
    <div class="topbar">
      <img draggable="false" class="logo unselectable" src="/logo.svg" alt="Quip Logo" />
      <div class="buttons">
        <a class="hover-underline-animation">
          <h3>
            Home
          </h3>
        </a>
        <a class="hover-underline-animation">
          <h3>
            Deposit
          </h3>
        </a>
        <a class="hover-underline-animation">
          <h3>
            Withdraw
          </h3>
        </a>
        <a class="hover-underline-animation">
          <h3>
            Profile
          </h3>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

$transitionTime: 0.3s;

.topbarBase {
  padding: 18px 64px;

  @include md-down {
    padding: 18px 32px;
  }

  @include sm-down {
    padding: 18px 24px;
  }

  position: sticky;
  top: 0;
  z-index: 100;
  background: v-bind('colors.background');
  transition: background $transitionTime ease-in-out, border-bottom-color $transitionTime ease-in-out;
  border-bottom: solid 1px transparent;

  @include sm-down {
    background: v-bind('colors["grey-light"]');
    transition: border-bottom-color $transitionTime ease-in-out;
  }
}

.topbarBaseScrolled {
  background: v-bind('colors["grey-light"]');
  border-bottom-color: v-bind('colors["border-grey"]');
}

.topbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
}

.logo {
  height: 90%;
}

a {
  background: none;
  border: none;
  cursor: pointer;
  padding: 13px 20px;
}

h3 {
  font-weight: normal;
  font-size: 16px;

  @include md-down {
    font-size: 16px;
    line-height: 20px;
  }
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
