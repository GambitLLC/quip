<script setup lang="ts">
import QuipQrCode from '~/components/util/QuipQrCode.client.vue';
import { Icon } from '@iconify/vue';
import { useTheme } from 'vuetify';
import {
  Notification,
  NotificationType,
  useNotifications,
} from '~/store/NotificationStore';

const notifications = useNotifications();

const colors = useTheme().current.value.colors;

const { address, shortAddress } = useCrypto();

function copyAddress() {
  if (address.value === null) return;
  navigator.clipboard.writeText(address.value);

  notifications.addNotification(new Notification(NotificationType.SUCCESS, "Copied Address!"));
}
</script>

<template>
  <div>
    <div>
      <h3 class="mb-2 subtext">QR Code</h3>
      <div v-if="address" class="d-flex align-center justify-center">
        <QuipQrCode :data="address" :size="160" />
      </div>
    </div>
    <div class="mt-6">
      <h3 class="mb-2 subtext">Wallet Address</h3>
      <div
        @click="copyAddress"
        v-ripple
        class="address text-border-grey rounded-pill d-flex align-center px-6 unselectable justify-space-between"
      >
        <h3 class="addressText text-secondary-grey">
          {{ shortAddress }}
        </h3>
        <Icon
          class="copyIcon text-primary"
          icon="material-symbols:content-copy-outline-rounded"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
h3 {
  color: v-bind('colors.jetblack');
}

.subtext {
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  opacity: 0.4;
}

.address {
  height: 48px;
  border: 1px solid;
  cursor: pointer;
}

.addressText {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
}

.copyIcon {
  font-size: 24px;
}
</style>
