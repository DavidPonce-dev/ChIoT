"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth";

export type NotificationPermission = "default" | "granted" | "denied";

interface PushNotificationState {
  permission: NotificationPermission;
  supported: boolean;
  enabled: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    permission: "default",
    supported: false,
    enabled: false,
  });
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "Notification" in window;
    const permission = supported ? Notification.permission : "default";

    setState({
      permission,
      supported,
      enabled: permission === "granted",
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      setState((prev) => ({
        ...prev,
        permission,
        enabled: granted,
      }));

      return granted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }, []);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (state.permission !== "granted") {
        console.warn("Notifications not permitted");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/icons/icon-192.svg",
          badge: "/icons/icon-192.svg",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Failed to show notification:", error);
      }
    },
    [state.permission]
  );

  const showDeviceNotification = useCallback(
    (deviceName: string, message: string) => {
      showNotification(`${deviceName}`, {
        body: message,
        tag: `device-${deviceName}`,
        requireInteraction: false,
      });
    },
    [showNotification]
  );

  const isEnabled = state.enabled && isAuthenticated;

  return {
    ...state,
    isEnabled,
    requestPermission,
    showNotification,
    showDeviceNotification,
  };
}
