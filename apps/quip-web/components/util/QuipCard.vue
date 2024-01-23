<script setup lang="ts">
import { useTheme } from "vuetify";

const props = defineProps<{
  hasBorder?: boolean;
}>();

const colors = useTheme().current.value.colors;
</script>

<template>
  <div class="card" :class="{ quipBorder: hasBorder }">
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  border-radius: 56px;
  position: relative;
}

.quipBorder {
  border: 1px solid v-bind(colors[ "border-grey"]);
}
</style>
