<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="footerPadding w-100">
    <div class="footer w-100 d-flex flex-column align-center justify-end">
      <img class="mb-6 footerLogo" src="/logoFooter.svg" alt="footer-logo">
      <p>All Rights Reserved Quip {{currentYear}}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixins.scss";

.footerPadding {
  padding-bottom: 80px;

  @include sm-down {
    padding-bottom: 67px;
  }
}

.footer {
  height: 145px;
}

.footerLogo {
  height: 44px;
}

p {
  font-weight: 300;
  font-size: 18px;
  line-height: 22px;
}
</style>
