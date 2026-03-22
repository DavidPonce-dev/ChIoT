"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  LedStripDevice,
  ThermostatDevice,
  SmartLockDevice,
  SensorDevice,
  LedStripState,
  LedStripMode,
  ThermostatMode,
} from "@/lib/api";

type AnyDevice = LedStripDevice | ThermostatDevice | SmartLockDevice | SensorDevice;

const DEVICE_QUERY_KEYS = {
  all: ["devices"] as const,
  leds: ["leds"] as const,
  thermostats: ["thermostats"] as const,
  locks: ["locks"] as const,
  sensors: ["sensors"] as const,
};

export function useDevices() {
  const queryClient = useQueryClient();

  const { data: leds = [], isLoading: isLoadingLeds } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.leds,
    queryFn: () => api.ledStrips.list() as Promise<LedStripDevice[]>,
  });

  const { data: thermostats = [], isLoading: isLoadingThermostats } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.thermostats,
    queryFn: () => api.thermostats.list() as Promise<ThermostatDevice[]>,
  });

  const { data: locks = [], isLoading: isLoadingLocks } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.locks,
    queryFn: () => api.locks.list() as Promise<SmartLockDevice[]>,
  });

  const { data: sensors = [], isLoading: isLoadingSensors } = useQuery({
    queryKey: DEVICE_QUERY_KEYS.sensors,
    queryFn: () => api.sensors.list() as Promise<SensorDevice[]>,
  });

  const devices: AnyDevice[] = [...leds, ...thermostats, ...locks, ...sensors];
  const isLoading = isLoadingLeds || isLoadingThermostats || isLoadingLocks || isLoadingSensors;

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.leds });
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.thermostats });
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.locks });
    queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.sensors });
  }, [queryClient]);

  return {
    devices,
    leds,
    thermostats,
    locks,
    sensors,
    isLoading,
    refetch,
  };
}

export function useLedStrip(uuid: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Partial<LedStripState>) => api.ledStrips.update(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.leds });
    },
  });

  return {
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}

export function useLedStripActions(uuid: string) {
  const { update, isUpdating } = useLedStrip(uuid);

  const setColor = (color: string) => update({ color });
  const setBrightness = (brightness: number) => update({ brightness });
  const setMode = (mode: LedStripMode) => update({ mode });
  const setSpeed = (speed: number) => update({ speed });
  const togglePower = (currentPower: boolean) => update({ power: !currentPower });

  return { setColor, setBrightness, setMode, setSpeed, togglePower, isUpdating };
}

export function useThermostat(uuid: string) {
  const queryClient = useQueryClient();

  const setTempMutation = useMutation({
    mutationFn: ({ temp, mode }: { temp: number; mode?: ThermostatMode }) =>
      api.thermostats.setTemp(uuid, temp, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.thermostats });
    },
  });

  const setModeMutation = useMutation({
    mutationFn: (mode: ThermostatMode) => api.thermostats.setMode(uuid, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.thermostats });
    },
  });

  return {
    setTemperature: setTempMutation.mutate,
    setMode: setModeMutation.mutate,
    isPending: setTempMutation.isPending || setModeMutation.isPending,
  };
}

export function useSmartLock(uuid: string) {
  const queryClient = useQueryClient();

  const lockMutation = useMutation({
    mutationFn: () => api.locks.lock(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.locks });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: () => api.locks.unlock(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.locks });
    },
  });

  return {
    lock: lockMutation.mutate,
    unlock: unlockMutation.mutate,
    isPending: lockMutation.isPending || unlockMutation.isPending,
  };
}

export function useCreateDevice() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ type, name }: { type: string; name: string }) => {
      switch (type) {
        case "LED_STRIP":
          return api.ledStrips.create({ name });
        case "thermostat":
          return api.thermostats.create({ name });
        case "smart_lock":
          return api.locks.create(name);
        case "sensor":
          return api.sensors.create(name);
        default:
          throw new Error(`Unknown device type: ${type}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.all });
    },
  });

  return mutation;
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ uuid, type }: { uuid: string; type: string }) => {
      switch (type) {
        case "LED_STRIP":
          return api.ledStrips.delete(uuid);
        case "thermostat":
          return api.thermostats.delete(uuid);
        case "smart_lock":
          return api.locks.delete(uuid);
        case "sensor":
          return api.sensors.delete(uuid);
        default:
          throw new Error(`Unknown device type: ${type}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVICE_QUERY_KEYS.all });
    },
  });

  return mutation;
}
