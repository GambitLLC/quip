<script setup lang="ts">
const props = defineProps<{
  color: "green" | "purple" | "blue",
}>()

const computedColor = computed(() => `bg-${props.color}-light`)
const computedColorAccent = computed(() => `bg-${props.color}-dark`)
</script>

<template>
<div>

</div>
</template>

<style lang="scss">

</style>
