"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/components/ui/toaster";

export function NotificationToggle() {
  const [mounted, setMounted] = useState(false);
  const { isEnabled, permission, supported, requestPermission } = usePushNotifications();
  const { toast } = useToast();

  useState(() => {
    setMounted(true);
  });

  const handleToggle = async () => {
    if (!supported) {
      toast("error", "Tu navegador no soporta notificaciones push");
      return;
    }

    if (permission === "denied") {
      toast("error", "Notificaciones bloqueadas. Habilítalas en la configuración del navegador.");
      return;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (granted) {
        toast("success", "Notificaciones habilitadas");
      } else {
        toast("error", "No se pudo habilitar las notificaciones");
      }
    } else {
      toast("info", "Las notificaciones están activas");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        isEnabled
          ? "text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20"
          : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--secondary)]"
      }`}
      title={isEnabled ? "Notificaciones activas" : "Activar notificaciones"}
      aria-label={isEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
    >
      {isEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
}
