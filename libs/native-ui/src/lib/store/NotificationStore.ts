import { create } from "zustand";

interface Notification {
  message: string,
  type: "success" | "error" | "warning" | "info",
  timeout?: number,
}

interface NotificationStore {
  notifications: Notification[],
  add: (notification: Notification) => void,
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  remove: (notification: Notification) => set((state) => ({
    notifications: state.notifications.filter((n) => n !== notification)
  })),
  add: (notification: Notification) => set((state) => {
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n !== notification)
      }))
    }, notification.timeout || 3000)

    return {
      notifications: [...state.notifications, notification]
    }
  })

}))

export {
  Notification,
  NotificationStore,
  useNotificationStore
}
