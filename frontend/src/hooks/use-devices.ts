"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { 
  LedStripDevice, 
  ThermostatDevice, 
  SmartLockDevice, 
  SensorDevice 
} from "@/lib/api";

type AnyDevice = LedStripDevice | ThermostatDevice | SmartLockDevice | SensorDevice;

export function useDevices() {
  const [devices, setDevices] = useState<AnyDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leds, thermostats, locks, sensors] = await Promise.all([
        api.ledStrips.list(),
        api.thermostats.list(),
        api.locks.list(),
        api.sensors.list(),
      ]);
      setDevices([...leds, ...thermostats, ...locks, ...sensors]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar dispositivos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {
    devices,
    isLoading,
    error,
    refetch: fetchDevices,
  };
}
