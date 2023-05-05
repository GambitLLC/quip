<script setup lang="ts">
import View from "~/components/util/View.vue";
import {useUser} from "~/store/UserStore";
import Avatar from "~/components/util/Avatar/Avatar.vue";
import QuipButton from "~/components/util/QuipButton.vue";
import Tabs from "~/components/util/Tabs.vue";
import {useTheme} from "vuetify";
import GeneralTab from "~/components/profile/GeneralTab.vue";
import {useModal} from "~/store/ModalStore";

const colors = useTheme().current.value.colors
const user = useUser().user
const modal = useModal()
</script>

<template>
  <View v-if="user">
    <div class="w-100 profileArea mx-auto mt-8">
      <div class="d-flex align-center">
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
        <div class="flex-grow-1"/>
        <QuipButton @click="modal.open('AvatarCreator')" class="editBtn text-jetblack" :width="262">
          Edit Profile Picture
        </QuipButton>
      </div>
      <Tabs class="mt-10 unselectable" :tabs="['General Info', 'Personal Info', 'Preferences', 'Refer a Friend']" :active-tab="0"/>
      <div class="dividerHolder">
        <v-divider class="text-border-grey divider fullDivider"/>
      </div>
      <GeneralTab/>
    </div>
  </View>
</template>

<style scoped lang="scss">
.profileArea {
  max-width: 832px;
}

.editBtn {
  border: solid 2px;
}

.divider {
  opacity: 1 !important;
}

h3 {
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 22px;
  color: v-bind("colors.jetblack");
}

.dividerHolder {
  position: relative;
  height: 1px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.fullDivider {
  position: absolute;
  width: 100vw;
}
</style>
