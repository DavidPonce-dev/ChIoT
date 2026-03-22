"use client";

import { useState } from "react";
import { api, SmartLockDevice } from "@/lib/api";
import { Lock, Unlock, Trash2, Loader2 } from "lucide-react";

interface SmartLockCardProps {
  device: SmartLockDevice;
}

export function SmartLockCard({ device }: SmartLockCardProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const state = device.state;
  const isLocked = state.locked ?? true;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isLocked) {
        await api.locks.unlock(device.uuid);
      } else {
        await api.locks.lock(device.uuid);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este dispositivo?")) return;
    setDeleting(true);
    try {
      await api.locks.delete(device.uuid);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Cerradura Inteligente</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="text-center py-8">
        <div
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${
            isLocked ? "bg-green-500/20" : "bg-yellow-500/20"
          }`}
        >
          {loading ? (
            <Loader2 className="w-12 h-12 animate-spin text-[var(--primary)]" />
          ) : isLocked ? (
            <Lock className="w-12 h-12 text-green-500" />
          ) : (
            <Unlock className="w-12 h-12 text-yellow-500" />
          )}
        </div>
        <p
          className={`text-lg font-medium ${
            isLocked ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {isLocked ? "Bloqueado" : "Desbloqueado"}
        </p>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isLocked
            ? "bg-yellow-500 hover:bg-yellow-500/90 text-black"
            : "bg-green-500 hover:bg-green-500/90 text-white"
        }`}
      >
        {isLocked ? (
          <>
            <Unlock className="w-5 h-5" />
            Desbloquear
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Bloquear
          </>
        )}
      </button>
    </div>
  );
}
