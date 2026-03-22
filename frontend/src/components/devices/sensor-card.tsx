"use client";

import { useState } from "react";
import { api, SensorDevice } from "@/lib/api";
import { Activity, Trash2, Loader2 } from "lucide-react";

interface SensorCardProps {
  device: SensorDevice;
}

export function SensorCard({ device }: SensorCardProps) {
  const [deleting, setDeleting] = useState(false);
  const state = device.state;

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este dispositivo?")) return;
    setDeleting(true);
    try {
      await api.sensors.delete(device.uuid);
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
          <p className="text-sm text-[var(--muted-foreground)]">Sensor</p>
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

      <div className="flex items-center gap-4 py-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
          <Activity className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          {state.temperature !== undefined && (
            <div className="text-2xl font-bold">
              {state.temperature}°C
              <span className="text-sm font-normal text-[var(--muted-foreground)] ml-2">
                Temperatura
              </span>
            </div>
          )}
          {state.humidity !== undefined && (
            <div className="text-lg text-[var(--muted-foreground)]">
              {state.humidity}% Humedad
            </div>
          )}
          {state.temperature === undefined && state.humidity === undefined && (
            <p className="text-[var(--muted-foreground)]">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  );
}
