<script setup lang="ts" generic="T">


import Tab from "~/components/util/Tabs/Tab.vue";

const props = defineProps<{
  tabs: T[],
  modelValue: T,
}>()

const emits = defineEmits<{ (e: 'update:modelValue', value: T): void }>()

function switchTab(i: number) {
  emits('update:modelValue', props.tabs[i])
}

</script>

<template>
  <div class="d-flex">
    <div
      v-for="(tab, i) in tabs"
      :key="i"
      @click="switchTab(i)"
    >
      <slot :tab="tab" :first="i === 0">
        <Tab class="mr-10" :text="tab" :selected-value="modelValue"/>
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
