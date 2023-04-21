<script setup lang="ts">
import {range} from "~/util/iteration";
</script>

<template>
<div class="w-100 faq bg-jetblack">
  <div class="faqTitle w-100 d-flex align-center justify-center">
    <FAQTitle/>
  </div>
  <div class="faqArea px-8">
    <Collapsible :has-divider="false" class="mb-12" :open="true" v-for="i in range(5)">
      <template #header>
        <h1 class="text-white">
          What is Quip?
        </h1>
      </template>
      <template #body>
        <p class="text-white">
          Quip is a web-based game that allows you to play with your friends in real-time. You can play with up to 10 friends in a single game, and you can play with up to 10 games at once. You can also play with your friends in a private game, where you can play with up to 10 friends in a single game, and you can play with up to 10 games at once.
        </p>
      </template>
    </Collapsible>
    <v-divider/>
    <QuipFooter/>
  </div>
</div>
</template>

<style scoped lang="scss">
@import "styles/mixins.scss";

.faq {
  padding-top: 162px;

  @include sm-down {
    padding-top: 53px;
  }
}

.faqTitle {
  margin-bottom: 96px;

  @include sm-down {
    margin-bottom: 60px;
  }
}

.faqArea {
  margin: 0 auto;
  max-width: 900px;
}

h1 {
  font-size: 40px;
  line-height: 100%;

  @include sm-down {
    font-size: 24px;
    line-height: 100%;
  }
}

p {
  font-weight: 300;
  font-size: 18px;
  line-height: 22px;

  @include sm-down {
    font-size: 14px;
    line-height: 18px;
  }
}
</style>
