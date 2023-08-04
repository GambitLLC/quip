import { create } from "zustand";

interface INotification {
  id: string,
  message: string,
  type: "success" | "error" | "warning" | "info",
  timeout?: number,
}

interface NotificationStore {
  notifications: INotification[],
  add: (notification: INotification) => void,
  remove: (notification: INotification) => void,
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  remove: (notification: INotification) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== notification.id)
  })),
  add: (notification: INotification) => set((state) => ({
    notifications: [...state.notifications, notification]
  }))
}))

export {
  INotification,
  NotificationStore,
  useNotificationStore
}
