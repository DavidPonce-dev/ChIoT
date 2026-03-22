"use client";

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useDeviceStatusStore } from "@/store/device-status";
import styles from "./connection-indicator.module.css";

export function ConnectionIndicator() {
  const { wsStatus } = useDeviceStatusStore();

  const statusConfig = {
    connected: {
      icon: Wifi,
      label: "Conectado",
      className: styles.connected,
    },
    connecting: {
      icon: Loader2,
      label: "Conectando...",
      className: styles.connecting,
    },
    disconnected: {
      icon: WifiOff,
      label: "Desconectado",
      className: styles.disconnected,
    },
    error: {
      icon: WifiOff,
      label: "Error de conexión",
      className: styles.error,
    },
  };

  const config = statusConfig[wsStatus];
  const Icon = config.icon;

  return (
    <div className={`${styles.indicator} ${config.className}`} title={config.label}>
      <Icon className={`${styles.icon} ${wsStatus === "connecting" ? styles.spinning : ""}`} />
      <span className={styles.label}>{config.label}</span>
    </div>
  );
}
