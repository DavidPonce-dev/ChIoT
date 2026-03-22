import { create } from "zustand";
import type { ConnectionStatus } from "@/hooks/use-websocket";

interface DeviceStatus {
  uuid: string;
  online: boolean;
  lastSeen?: Date;
}

interface DeviceStatusState {
  deviceStatuses: Record<string, DeviceStatus>;
  wsStatus: ConnectionStatus;
  setDeviceOnline: (uuid: string, online: boolean) => void;
  setDeviceLastSeen: (uuid: string, lastSeen: Date) => void;
  getDeviceStatus: (uuid: string) => DeviceStatus | undefined;
  isDeviceOnline: (uuid: string) => boolean;
  setWsStatus: (status: ConnectionStatus) => void;
}

export const useDeviceStatusStore = create<DeviceStatusState>()((set, get) => ({
  deviceStatuses: {},
  wsStatus: "disconnected",

  setDeviceOnline: (uuid, online) =>
    set((state) => ({
      deviceStatuses: {
        ...state.deviceStatuses,
        [uuid]: {
          ...state.deviceStatuses[uuid],
          uuid,
          online,
          lastSeen: online ? new Date() : state.deviceStatuses[uuid]?.lastSeen,
        },
      },
    })),

  setDeviceLastSeen: (uuid, lastSeen) =>
    set((state) => ({
      deviceStatuses: {
        ...state.deviceStatuses,
        [uuid]: {
          ...state.deviceStatuses[uuid],
          uuid,
          lastSeen,
          online: true,
        },
      },
    })),

  getDeviceStatus: (uuid) => get().deviceStatuses[uuid],

  isDeviceOnline: (uuid) => get().deviceStatuses[uuid]?.online ?? false,

  setWsStatus: (status) => set({ wsStatus: status }),
}));
