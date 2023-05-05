<script setup lang="ts">
import QuipButton from "~/components/util/QuipButton.vue";
import QuipCard from "~/components/util/QuipCard.vue";
import {useTheme} from "vuetify";
import {useUser} from "~/store/UserStore";

const colors = useTheme().current.value.colors
const user = useUser().user
</script>

<template>
  <div>
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
          {{user?.name}}
        </h3>
      </div>
      <v-divider class="text-border-grey divider"/>
      <div class="cardRow px-8">
        <h3 class="subtext">Email Address</h3>
        <h3>
          {{user?.email}}
        </h3>
      </div>
      <v-divider class="text-border-grey divider"/>
      <div class="cardRow px-8">
        <h3 class="subtext">Bitcoin Address</h3>
        <h3>
          {{user?.btcAddress}}
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
</template>

<style scoped lang="scss">
.contentCard {
  border-radius: 24px !important;
  margin-top: 117px;
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

.divider {
  opacity: 1 !important;
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

h3 {
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 22px;
  color: v-bind("colors.jetblack");
}

.closeBorder {
  border: solid 2px v-bind("colors.jetblack");
}
</style>
