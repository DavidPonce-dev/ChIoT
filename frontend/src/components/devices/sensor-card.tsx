"use client";

import dynamic from "next/dynamic";
import { DeleteButton } from "./delete-button";
import { OnlineIndicator } from "@/components/ui/online-indicator";
import type { SensorDevice } from "@/lib/api";
import { Thermometer, Droplets } from "lucide-react";

const SensorChart = dynamic(() => import("./sensor-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-24 flex items-center justify-center text-[var(--muted-foreground)] text-sm">
      Cargando gráfico...
    </div>
  ),
});

interface SensorCardProps {
  device: SensorDevice;
}

export function SensorCard({ device }: SensorCardProps) {
  const state = device.state;
  const hasData = state.temperature !== undefined || state.humidity !== undefined;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Sensor</p>
          </div>
          <OnlineIndicator uuid={device.uuid} size="sm" />
        </div>
        <DeleteButton
          uuid={device.uuid}
          type="sensor"
          deviceName={device.name}
        />
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <Thermometer className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
              <p className="text-2xl font-bold">
                {state.temperature !== undefined ? `${state.temperature}°C` : "--"}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Temperatura</p>
            </div>
            <div className="text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {state.humidity !== undefined ? `${state.humidity}%` : "--"}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Humedad</p>
            </div>
          </div>
          <SensorChart device={device} />
        </>
      ) : (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Sin datos disponibles</p>
          <p className="text-sm">Esperando lectura del sensor...</p>
        </div>
      )}
    </div>
  );
}
