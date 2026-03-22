"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useDeviceStatusStore } from "@/store/device-status";
import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  uuid: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function OnlineIndicator({ uuid, size = "md", showLabel = false }: OnlineIndicatorProps) {
  const isOnline = useDeviceStatusStore((state) => state.isDeviceOnline(uuid));
  const status = useDeviceStatusStore((state) => state.getDeviceStatus(uuid));

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "rounded-full transition-colors",
            sizeClasses[size],
            isOnline ? "bg-green-500" : "bg-red-500"
          )}
        />
        {isOnline && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75",
              sizeClasses[size]
            )}
          />
        )}
      </div>
      {showLabel && (
        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
          {isOnline ? (
            <>
              <Wifi className={iconSizeClasses[size]} />
              <span>En línea</span>
            </>
          ) : (
            <>
              <WifiOff className={iconSizeClasses[size]} />
              <span>Desconectado</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
