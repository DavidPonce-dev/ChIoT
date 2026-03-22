"use client";

import { useToast } from "@/components/ui/toaster";
import { useSmartLock } from "@/hooks/use-devices";
import { DeleteButton } from "./delete-button";
import { OnlineIndicator } from "@/components/ui/online-indicator";
import type { SmartLockDevice } from "@/lib/api";
import { Lock, Unlock } from "lucide-react";

interface SmartLockCardProps {
  device: SmartLockDevice;
}

export function SmartLockCard({ device }: SmartLockCardProps) {
  const { toast } = useToast();
  const state = device.state;
  const { lock, unlock, isPending } = useSmartLock(device.uuid);

  const isLocked = state.locked ?? true;

  const handleToggle = async () => {
    try {
      if (isLocked) {
        unlock();
        toast("success", `${device.name} desbloqueado`);
      } else {
        lock();
        toast("success", `${device.name} bloqueado`);
      }
    } catch {
      toast("error", "Error al cambiar estado");
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Cerradura Inteligente</p>
          </div>
          <OnlineIndicator uuid={device.uuid} size="sm" />
        </div>
        <DeleteButton
          uuid={device.uuid}
          type="smart_lock"
          deviceName={device.name}
        />
      </div>

      <div className="flex flex-col items-center py-8">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
            isLocked
              ? "bg-green-500/20 text-green-500"
              : "bg-yellow-500/20 text-yellow-500"
          }`}
        >
          {isLocked ? (
            <Lock className="w-10 h-10" />
          ) : (
            <Unlock className="w-10 h-10" />
          )}
        </div>

        <p className={`text-lg font-medium mb-4 ${
          isLocked ? "text-green-500" : "text-yellow-500"
        }`}>
          {isLocked ? "Bloqueado" : "Desbloqueado"}
        </p>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            isLocked
              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isPending ? (
            "Procesando..."
          ) : isLocked ? (
            "Desbloquear"
          ) : (
            "Bloquear"
          )}
        </button>
      </div>
    </div>
  );
}
