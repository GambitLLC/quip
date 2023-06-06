<script setup lang="ts">
import Topbar from "~/components/util/Topbar/Topbar.vue";
import { useTheme } from "vuetify";

const router = useRouter()
const computedRoute = computed(() => router.currentRoute.value.name)

const props = defineProps<{
  hasSafeArea?: boolean
}>()

const colors = useTheme().current.value.colors
</script>

<template>
  <div v-if="computedRoute !== 'index'" class="h-100 w-100 d-flex flex-column bg">
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
.bg {
  background: v-bind("colors.background");
}
</style>
