"use client";

import { useState } from "react";
import { api, ThermostatDevice, ThermostatMode } from "@/lib/api";
import { Loader2, Thermometer, Trash2 } from "lucide-react";

interface ThermostatCardProps {
  device: ThermostatDevice;
}

export function ThermostatCard({ device }: ThermostatCardProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const state = device.state;

  const handleSetTemp = async (temp: number) => {
    setLoading(true);
    try {
      await api.thermostats.setTemp(device.uuid, temp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetMode = async (mode: ThermostatMode) => {
    setLoading(true);
    try {
      await api.thermostats.setMode(device.uuid, mode);
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
      await api.thermostats.delete(device.uuid);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const currentTemp = state.temperature ?? 22;
  const mode = state.mode ?? "off";

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Termostato</p>
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
          disabled={loading || currentTemp <= 16}
          className="w-12 h-12 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 disabled:opacity-50 text-xl font-bold"
        >
          -
        </button>
        <button
          onClick={() => handleSetTemp(currentTemp + 1)}
          disabled={loading || currentTemp >= 30}
          className="w-12 h-12 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 disabled:opacity-50 text-xl font-bold"
        >
          +
        </button>
      </div>

      <div className="flex gap-2">
        {(["off", "cool", "heat"] as ThermostatMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleSetMode(m)}
            disabled={loading}
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
            {m === "off" ? "Apagado" : m === "cool" ? "Enfriar" : "Calentar"}
          </button>
        ))}
      </div>
    </div>
  );
}
