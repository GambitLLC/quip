<script setup lang="ts">
import Avatar from "~/components/util/Avatar/Avatar.vue";
import {accessories, eyes, faces, hairs, mouths, outfits} from "~/components/util/Avatar/types";
</script>

<template>
  <div class="pa-16">
    <div class="d-flex flex-row justify-space-between flex-wrap">
      <div class="w-100 d-flex flex-column align-center">
        <h1 class="py-16">
          Jon
        </h1>
        <Avatar eye="Normal" face="Light" mouth="Open_Tooth" outfit="03" :size="200" hair="07" color="bg-green-light"/>
      </div>
      <div class="w-100 d-flex flex-column align-center">
        <h1 class="py-16">
          Alex
        </h1>
        <Avatar accessory="Rounded_Glasses" eye="Normal" face="Fair" mouth="Eat" outfit="20" :size="200" hair="03" color="bg-green-light"/>
      </div>
      <div class="w-100 d-flex flex-column align-center">
        <h1 class="py-16">
          Randolph
        </h1>
        <Avatar accessory="Earphone" eye="Cynic" face="Light" mouth="Hate" outfit="06" :size="200" hair="16" color="bg-green-light"/>
      </div>
      <div class="w-100 d-flex flex-column align-center">
        <h1 class="py-16">
          Ben
        </h1>
        <Avatar eye="Thin" face="Light" mouth="Open_Mouth" outfit="01" :size="200" hair="08" color="bg-green-light"/>
      </div>
    </div>
  </div>
<!--  <div class="w-100 h-100">-->
<!--    <h1 class="py-8">Accessories:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="a in accessories">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          :accessory="a"-->
<!--          eye="Normal"-->
<!--          face="Light"-->
<!--          hair="23"-->
<!--          mouth="Cute"-->
<!--          outfit="01"-->
<!--        />-->
<!--        <h3>{{a}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--    <h1 class="py-8">Eyes:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="e in eyes">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          accessory="Simple_Earring"-->
<!--          :eye="e"-->
<!--          face="Light"-->
<!--          hair="23"-->
<!--          mouth="Cute"-->
<!--          outfit="01"-->
<!--        />-->
<!--        <h3>{{e}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--    <h1 class="py-8">Faces:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="f in faces">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          accessory="Simple_Earring"-->
<!--          eye="Normal"-->
<!--          :face="f"-->
<!--          hair="23"-->
<!--          mouth="Cute"-->
<!--          outfit="01"-->
<!--        />-->
<!--        <h3>{{f}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--    <h1 class="py-8">Hairs:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="h in hairs">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          accessory="Simple_Earring"-->
<!--          eye="Normal"-->
<!--          face="Light"-->
<!--          :hair="h"-->
<!--          mouth="Cute"-->
<!--          outfit="01"-->
<!--        />-->
<!--        <h3>{{h}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--    <h1 class="py-8">Mouths:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="m in mouths">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          accessory="Simple_Earring"-->
<!--          eye="Normal"-->
<!--          face="Light"-->
<!--          hair="23"-->
<!--          :mouth="m"-->
<!--          outfit="01"-->
<!--        />-->
<!--        <h3>{{m}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--    <h1 class="py-8">Outfits:</h1>-->
<!--    <div class="d-flex flex-wrap">-->
<!--      <div class="d-flex pa-2 w-25" v-for="o in outfits">-->
<!--        <Avatar-->
<!--          :size="295"-->
<!--          color="bg-green-light"-->
<!--          accessory="Simple_Earring"-->
<!--          eye="Normal"-->
<!--          face="Light"-->
<!--          hair="03"-->
<!--          mouth="Cute"-->
<!--          :outfit="o"-->
<!--        />-->
<!--        <h3>{{o}}</h3>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
</template>

<style scoped lang="scss">

</style>
