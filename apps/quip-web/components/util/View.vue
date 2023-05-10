<script setup lang="ts">
import Topbar from "~/components/util/Topbar/Topbar.vue";

const router = useRouter()
const computedRoute = computed(() => router.currentRoute.value.name)

const props = defineProps<{
  hasSafeArea?: boolean
}>()
</script>

<template>
  <div v-if="computedRoute !== 'index'" class="h-100 w-100 d-flex flex-column">
    <ClientOnly>
      <Topbar/>
    </ClientOnly>
    <div :class="{'safeArea': hasSafeArea}" class="d-flex w-100 h-100 mt-2">
      <div class="w-100 h-100">
        <slot/>
      </div>
    </div>
  </div>
  <div v-else>
    <slot/>
  </div>
</template>

<style scoped lang="scss">
</style>
