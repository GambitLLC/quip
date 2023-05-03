<script setup lang="ts">
import View from "~/components/util/View.vue";
import {useUser} from "~/store/UserStore";
import Avatar from "~/components/util/Avatar/Avatar.vue";
import QuipButton from "~/components/util/QuipButton.vue";
import Tabs from "~/components/util/Tabs.vue";
import QuipCard from "~/components/util/QuipCard.vue";
import {useTheme} from "vuetify";

const colors = useTheme().current.value.colors
const user = useUser().user
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
        <QuipButton class="editBtn text-jetblack" :width="262">
          Edit Profile Picture
        </QuipButton>
      </div>
      <Tabs class="mt-10" :tabs="['General Info', 'Personal Info', 'Preferences', 'Refer a Friend']" :active-tab="0"/>
      <div class="dividerHolder">
        <v-divider class="text-border-grey divider fullDivider"/>
      </div>
      <QuipCard has-border class="bg-white contentCard">
        <div class="d-flex align-center cardHeader px-8">
          <h3>
            General Info
          </h3>
        </div>
        <v-divider class="text-border-grey divider"/>
        <div class="cardRow px-8">
          <h3 class="subtext">Display Name</h3>
          <h3>
            {{user.name}}
          </h3>
        </div>
        <v-divider class="text-border-grey divider"/>
        <div class="cardRow px-8">
          <h3 class="subtext">Email Address</h3>
          <h3>
            {{user.email}}
          </h3>
        </div>
        <v-divider class="text-border-grey divider"/>
        <div class="cardRow px-8">
          <h3 class="subtext">Bitcoin Address</h3>
          <h3>
            {{user.btcAddress}}
          </h3>
        </div>
      </QuipCard>
      <QuipCard has-border class="bg-white contentCard mt-7">
        <div class="d-flex flex-row align-center pa-8 w-100">
          <div :style="{maxWidth: '378px'}">
            <div class="mb-3">
              <h3>Close Account</h3>
            </div>
            <div>
              <h3 class="subtextClose">
                Closing your account can’t be undone. Please make sure your account balance is $0.00 before you begin.
              </h3>
            </div>
          </div>
          <div class="flex-grow-1"/>
          <QuipButton :width="188" class="text-red closeBorder">
            <div class="text-red">
              Close Account
            </div>
          </QuipButton>
        </div>

      </QuipCard>
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

.closeBorder {
  border: solid 2px v-bind("colors.jetblack");
}

.divider {
  opacity: 1 !important;
}

.cardHeader {
  height: 78px;
}

.cardRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 69px;
}

.contentCard {
  border-radius: 24px !important;
  margin-top: 117px;
}

h3 {
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 22px;
  color: v-bind("colors.jetblack");
}

.subtext {
  opacity: 0.4;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
}

.subtextClose {
  opacity: 0.4;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
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
