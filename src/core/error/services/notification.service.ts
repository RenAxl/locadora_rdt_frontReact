export interface NotificationMessage {
  severity: "success" | "error" | "info" | "warn";
  detail: string;
}

let showNotification: ((message: NotificationMessage) => void) | null = null;

export const notificationService = {
  register(callback: (message: NotificationMessage) => void): void {
    showNotification = callback;
  },

  add(message: NotificationMessage): void {
    if (showNotification) showNotification(message);
  },
};
