"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toaster";
import { useThermostat } from "@/hooks/use-devices";
import { DeleteButton } from "./delete-button";
import { OnlineIndicator } from "@/components/ui/online-indicator";
import type { ThermostatDevice, ThermostatMode } from "@/lib/api";
import { Thermometer } from "lucide-react";

interface ThermostatCardProps {
  device: ThermostatDevice;
}

const MODE_LABELS: Record<ThermostatMode, string> = {
  off: "Apagado",
  cool: "Enfriar",
  heat: "Calentar",
};

export function ThermostatCard({ device }: ThermostatCardProps) {
  const { toast } = useToast();
  const state = device.state;
  const { setTemperature, setMode, isPending } = useThermostat(device.uuid);
  const [localTemp, setLocalTemp] = useState(state.temperature ?? 22);

  const currentTemp = localTemp;
  const mode = state.mode ?? "off";

  const handleSetTemp = async (temp: number) => {
    const newTemp = Math.max(16, Math.min(30, temp));
    setLocalTemp(newTemp);
    try {
      setTemperature({ temp: newTemp });
    } catch {
      toast("error", "Error al establecer temperatura");
    }
  };

  const handleSetMode = async (newMode: ThermostatMode) => {
    try {
      setMode(newMode);
      toast("success", `Modo ${MODE_LABELS[newMode]}`);
    } catch {
      toast("error", "Error al cambiar modo");
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Termostato</p>
          </div>
          <OnlineIndicator uuid={device.uuid} size="sm" />
        </div>
        <DeleteButton
          uuid={device.uuid}
          type="thermostat"
          deviceName={device.name}
        />
      </div>

      <div className="text-center py-6">
        <div className="relative inline-block">
          <Thermometer
            className={`w-16 h-16 mx-auto mb-2 ${
              mode === "heat"
                ? "text-orange-500"
                : mode === "cool"
                ? "text-blue-500"
                : "text-[var(--muted-foreground)]"
            }`}
          />
          <span className="text-5xl font-bold">{currentTemp}°</span>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => handleSetTemp(currentTemp - 1)}
          disabled={isPending || currentTemp <= 16}
          className="w-12 h-12 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 disabled:opacity-50 text-xl font-bold transition-colors"
        >
          -
        </button>
        <button
          onClick={() => handleSetTemp(currentTemp + 1)}
          disabled={isPending || currentTemp >= 30}
          className="w-12 h-12 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 disabled:opacity-50 text-xl font-bold transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex gap-2">
        {(["off", "cool", "heat"] as ThermostatMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleSetMode(m)}
            disabled={isPending}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              mode === m
                ? m === "heat"
                  ? "bg-orange-500 text-white"
                  : m === "cool"
                  ? "bg-blue-500 text-white"
                  : "bg-[var(--secondary)] text-white"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/80"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
