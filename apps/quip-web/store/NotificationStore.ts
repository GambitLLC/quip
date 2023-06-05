import {defineStore} from "pinia";
import {v4 as uuidv4} from "uuid";

enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

interface INotification {
  type: NotificationType,
  message: string,
  timeout: number,
  isDismissable: boolean,
  onDismiss?: () => void
  id: string
}

class Notification implements INotification {
  type: NotificationType
  message: string
  timeout: number
  isDismissable: boolean
  onDismiss?: () => void
  id: string

  constructor(
    type: NotificationType,
    message: string,
    data?: {
      timeout?: number,
      isDismissable?: boolean,
      onDismiss?: () => void,
      id?: string
    },
  ) {
    this.type = type;
    this.message = message;
    this.timeout = data?.timeout ?? 5000;
    this.isDismissable = data?.isDismissable ?? true;
    this.onDismiss = data?.onDismiss;
    this.id = data?.id ?? uuidv4();
  }
}

interface NotificationStore {
  notifications: Array<INotification>,
}

const useNotifications = defineStore('notification', {
  state: (): NotificationStore => {
    return {
      notifications: [],
    }
  },
  actions: {
    addNotification(notification: INotification) {
      this.notifications.push(notification);
    },
    dismissNotification(notification: INotification) {
      this.notifications = this.notifications.filter(n => n !== notification);
    },
  }
})

export {
  useNotifications,
  NotificationType,
  Notification,
  INotification,
}
