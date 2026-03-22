"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, X } from "lucide-react";

interface AddDeviceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type DeviceType = "LED_STRIP" | "thermostat" | "smart_lock" | "sensor";

const DEVICE_TYPES: { value: DeviceType; label: string; icon: string }[] = [
  { value: "LED_STRIP", label: "Tira LED", icon: "💡" },
  { value: "thermostat", label: "Termostato", icon: "🌡️" },
  { value: "smart_lock", label: "Cerradura", icon: "🔒" },
  { value: "sensor", label: "Sensor", icon: "📡" },
];

export function AddDeviceModal({ onClose, onSuccess }: AddDeviceModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DeviceType>("LED_STRIP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      switch (type) {
        case "LED_STRIP":
          await api.ledStrips.create({ name });
          break;
        case "thermostat":
          await api.thermostats.create({ name });
          break;
        case "smart_lock":
          await api.locks.create(name);
          break;
        case "sensor":
          await api.sensors.create(name);
          break;
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear dispositivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Agregar Dispositivo</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Mi dispositivo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {DEVICE_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setType(dt.value)}
                  className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                    type === dt.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <span className="text-xl">{dt.icon}</span>
                  <span className="text-sm">{dt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-50 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear Dispositivo
          </button>
        </form>
      </div>
    </div>
  );
}
