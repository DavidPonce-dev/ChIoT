"use client";

import { useState } from "react";
import { api, LedStripDevice, LedStripState } from "@/lib/api";
import { Loader2, Trash2 } from "lucide-react";

interface LedStripCardProps {
  device: LedStripDevice;
  onDelete?: () => void;
}

type LedStripMode = "static" | "rainbow" | "fire" | "wave" | "candle";
const MODES: LedStripMode[] = ["static", "rainbow", "fire", "wave", "candle"];

export function LedStripCard({ device, onDelete }: LedStripCardProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const state = device.state;

  const handleUpdate = async (updates: Partial<LedStripState>) => {
    setLoading(true);
    try {
      await api.ledStrips.update(device.uuid, updates);
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
      await api.ledStrips.delete(device.uuid);
      onDelete?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <p className="text-sm text-muted-foreground">Tira LED</p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      <div
        className="w-full h-3 rounded-full mb-4 border border-border"
        style={{ backgroundColor: state.color || "#ffffff" }}
      />

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Brillo: {state.brightness ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={state.brightness ?? 100}
            onChange={(e) => handleUpdate({ brightness: Number(e.target.value) })}
            disabled={loading}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Color
          </label>
          <div className="flex gap-2">
            {["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff"].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => handleUpdate({ color: c })}
                  disabled={loading}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    state.color === c
                      ? "border-white scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
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
          <label className="text-sm text-muted-foreground mb-2 block">
            Modo
          </label>
          <div className="flex flex-wrap gap-2">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => handleUpdate({ mode })}
                disabled={loading}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  state.mode === mode
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Velocidad: {state.speed ?? 50}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={state.speed ?? 50}
            onChange={(e) => handleUpdate({ speed: Number(e.target.value) })}
            disabled={loading}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {loading && (
        <div className="absolute top-2 right-2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
