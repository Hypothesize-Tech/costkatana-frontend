// src/services/notification.service.ts
type NotificationHandler = (notification: AppNotification) => void;

interface AppNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  metadata?: any;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private handlers: Set<NotificationHandler> = new Set();
  private permission: NotificationPermission = "default";

  constructor() {
    this.checkPermission();
  }

  // In-app notifications
  show(
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    options?: {
      action?: {
        label: string;
        handler: () => void;
      };
      metadata?: any;
      duration?: number;
    },
  ): string {
    const notification: AppNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      action: options?.action,
      metadata: options?.metadata,
    };

    this.notifications.unshift(notification);
    this.notifyHandlers(notification);

    // Auto-dismiss after duration (if specified)
    if (options?.duration) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, options.duration);
    }

    // Also show browser notification for important types
    if (type === "error" || type === "warning") {
      this.showBrowserNotification(title, message, type);
    }

    return notification.id;
  }

  dismiss(id: string): void {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyHandlers();
    }
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyHandlers();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.notifyHandlers();
  }

  getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  clear(): void {
    this.notifications = [];
    this.notifyHandlers();
  }

  // Browser notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  private checkPermission(): void {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  private showBrowserNotification(
    title: string,
    body: string,
    type: "info" | "success" | "warning" | "error",
  ): void {
    if (this.permission !== "granted" || !("Notification" in window)) {
      return;
    }

    const icons: Record<string, string> = {
      info: "/icons/info.png",
      success: "/icons/success.png",
      warning: "/icons/warning.png",
      error: "/icons/error.png",
    };

    const notification = new Notification(title, {
      body,
      icon: icons[type] || "/icons/default.png",
      badge: "/icons/badge.png",
      tag: "ai-cost-optimizer",
      requireInteraction: type === "error",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Event handling
  subscribe(handler: NotificationHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private notifyHandlers(notification?: AppNotification): void {
    this.handlers.forEach((handler) => {
      try {
        handler(notification || this.notifications[0]);
      } catch (error) {
        console.error("Error in notification handler:", error);
      }
    });
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Preset notification methods
  success(message: string, title: string = "Success"): string {
    return this.show(title, message, "success", { duration: 5000 });
  }

  error(message: string, title: string = "Error"): string {
    return this.show(title, message, "error");
  }

  warning(message: string, title: string = "Warning"): string {
    return this.show(title, message, "warning");
  }

  info(message: string, title: string = "Info"): string {
    return this.show(title, message, "info", { duration: 5000 });
  }

  // Cost alerts
  costAlert(cost: number, threshold: number): string {
    return this.show(
      "Cost Alert",
      `Your daily cost ($${cost.toFixed(2)}) has exceeded the threshold ($${threshold.toFixed(2)})`,
      "warning",
      {
        action: {
          label: "View Usage",
          handler: () => (window.location.href = "/usage"),
        },
      },
    );
  }

  // Optimization alerts
  optimizationAvailable(promptId: string, savings: number): string {
    return this.show(
      "Optimization Available",
      `You can save $${savings.toFixed(2)} by optimizing this prompt`,
      "info",
      {
        action: {
          label: "Optimize Now",
          handler: () =>
            (window.location.href = `/optimizations?prompt=${promptId}`),
        },
      },
    );
  }
}

export const notificationService = new NotificationService();
