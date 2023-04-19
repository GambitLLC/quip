<script setup lang="ts">
const props = defineProps<{
  color: "green" | "purple" | "blue",
  layout: "left" | "right",
  title: string,
  text: string,
  bullets: string[],
  comingSoon?: boolean,
  img: string,
}>()

const computedColor = computed(() => `bg-${props.color}-light`)
const computedColorAccent = computed(() => `bg-${props.color}-dark`)

const computedBulletColor = computed(() => `bg-${props.color}-bullet`)
const computedBulletColorAccent = computed(() => `bg-${props.color}-bullet-accent`)
</script>

<template>
  <QuipCard :class="computedColor" class="gameCard mb-8">
    <div :class="{
      'flex-row': props.layout === 'right',
      'flex-row-reverse': props.layout === 'left',
    }" class="d-flex w-100 h-100 align-center pa-16">
      <div class="w-100 h-100">

      </div>
      <div class="w-100">
        <h1 class="text-jetblack-light mb-6">
          {{ title }}
        </h1>
        <p>
          {{ text }}
        </p>
        <div class="mt-10">
          <div v-for="(bullet, i) in bullets" :key="i" class="d-flex align-center mb-8">
            <div class="bullet" :class="computedBulletColor">
              <div class="bulletCircle" :class="computedBulletColorAccent"/>
            </div>
            <div class="bulletText co-headline text-jetblack-light ml-6">
              {{ bullet }}
            </div>
          </div>
        </div>
        <div class="learnMore">
          <QuipButton :width="176" class="learnMoreBtn text-jetblack">
            <h3>Learn More</h3>
          </QuipButton>
        </div>
      </div>
    </div>
  </QuipCard>
</template>

<style scoped lang="scss">
.gameCard {
  height: calc(100vh - 160px);
}

h1 {
  font-size: 80px;
  line-height: 80px;
}

p {
  max-width: 450px;
  font-weight: 300;
  font-size: 24px;
  line-height: 30px;
}

.learnMore {
  height: 48px;
  display: flex;
  align-items: center;
}

.learnMoreBtn {
  border: solid 2px;
}

.bullet {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulletCircle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.bulletText {
  font-weight: 400;
  font-size: 18px;
  line-height: 20px;
}
</style>
