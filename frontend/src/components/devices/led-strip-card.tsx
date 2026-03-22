"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toaster";
import { useLedStripActions, useDeleteDevice } from "@/hooks/use-devices";
import { DeleteButton } from "./delete-button";
import { OnlineIndicator } from "@/components/ui/online-indicator";
import type { LedStripDevice, LedStripState, LedStripMode } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface LedStripCardProps {
  device: LedStripDevice;
}

const MODES: LedStripMode[] = ["static", "rainbow", "fire", "wave", "candle"];

const MODE_LABELS: Record<LedStripMode, string> = {
  static: "Static",
  rainbow: "Rainbow",
  fire: "Fuego",
  wave: "Onda",
  candle: "Vela",
};

export function LedStripCard({ device }: LedStripCardProps) {
  const { toast } = useToast();
  const state = device.state;
  const { setColor, setBrightness, setMode, setSpeed, isUpdating } = useLedStripActions(device.uuid);
  const deleteDevice = useDeleteDevice();

  const handleUpdate = async (updates: Partial<LedStripState>, successMsg?: string) => {
    try {
      if (updates.color) setColor(updates.color);
      if (updates.brightness !== undefined) setBrightness(updates.brightness);
      if (updates.mode) setMode(updates.mode);
      if (updates.speed !== undefined) setSpeed(updates.speed);
      if (successMsg) toast("success", successMsg);
    } catch {
      toast("error", "Error al actualizar");
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Tira LED</p>
          </div>
          <OnlineIndicator uuid={device.uuid} size="sm" />
        </div>
        <DeleteButton
          uuid={device.uuid}
          type="LED_STRIP"
          deviceName={device.name}
        />
      </div>

      <div
        className="w-full h-3 rounded-full mb-4 border border-[var(--border)] transition-all"
        style={{ backgroundColor: state.color || "#ffffff", opacity: (state.brightness ?? 100) / 100 }}
      />

      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--muted-foreground)] mb-2 block">
            Brillo: {state.brightness ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={state.brightness ?? 100}
            onChange={(e) => handleUpdate({ brightness: Number(e.target.value) })}
            disabled={isUpdating}
            className="w-full accent-[var(--primary)]"
          />
        </div>

        <div>
          <label className="text-sm text-[var(--muted-foreground)] mb-2 block">
            Color
          </label>
          <div className="flex gap-2">
            {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff"].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => handleUpdate({ color: c })}
                  disabled={isUpdating}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    state.color === c
                      ? "border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              )
            )}
            <input
              type="color"
              value={state.color || "#ffffff"}
              onChange={(e) => handleUpdate({ color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-[var(--muted-foreground)] mb-2 block">
            Modo
          </label>
          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ mode })}
                disabled={isUpdating}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  state.mode === mode
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/80"
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-[var(--muted-foreground)] mb-2 block">
            Velocidad: {state.speed ?? 50}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={state.speed ?? 50}
            onChange={(e) => handleUpdate({ speed: Number(e.target.value) })}
            disabled={isUpdating}
            className="w-full accent-[var(--primary)]"
          />
        </div>
      </div>

      {isUpdating && (
        <div className="absolute top-2 right-2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
