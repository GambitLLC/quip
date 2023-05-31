<script setup lang="ts">
type SkeletonType = 'text' | 'circle' | 'rect'

const props = defineProps<{
  loading: boolean,
  width: string,
  height: string,
  radius?: string,
  type?: SkeletonType
}>()

const computedType = computed<SkeletonType>(() => props.type ?? 'text')
const computedRadius = computed<string>(() => props.radius ?? '9999px')
</script>

<template>
  <transition mode="out-in" name="fade">
    <div class="pa-1" :style="{width: width, height: height}" v-if="loading">
      <div class="skeleton w-100 h-100" :style="{borderRadius: computedRadius}">

      </div>

    </div>
    <div v-else>
      <slot/>
    </div>
  </transition>
</template>

<style>
@keyframes pulse-bg {
  0% {
    background-color: #ddd;
  }
  50% {
    background-color: #d0d0d0;
  }
  100% {
    background-color: #ddd;
  }
}

.skeleton {
  animation: pulse-bg 1s infinite;
}
</style>
