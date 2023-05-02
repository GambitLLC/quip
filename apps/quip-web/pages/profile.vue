<script setup lang="ts">
import View from "~/components/util/View.vue";
import {useUser} from "~/store/UserStore";
import Avatar from "~/components/util/Avatar/Avatar.vue";

const user = useUser().user
</script>

<template>
  <View v-if="user">
    <div class="d-flex">
      <Avatar
        :size="72"
        :eye="user.avatar.eye"
        :face="user.avatar.face"
        :mouth="user.avatar.mouth"
        :outfit="user.avatar.outfit"
        :color="user.avatar.color"
        :hair="user.avatar.hair"
        :accessory="user.avatar.accessory"
      />
      <div class="d-flex flex-column justify-center ml-6">
        <h3>{{user.name}}</h3>
        <h3>{{user.email}}</h3>
      </div>
    </div>
  </View>
</template>

<style scoped lang="scss">

</style>
