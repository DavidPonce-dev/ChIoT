"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/components/ui/toaster";
import { useDeviceStatusStore } from "@/store/device-status";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 
  (typeof window !== "undefined" && window.location.protocol === "https:" 
    ? "wss://" 
    : "wss://") + 
  (typeof window !== "undefined" ? window.location.host : "localhost:8080");

const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export type WebSocketEvent = {
  type: "device_state_changed" | "device_online" | "device_offline" | "notification";
  payload: Record<string, unknown>;
  uuid?: string;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setDeviceOnline, setDeviceLastSeen, setWsStatus } = useDeviceStatusStore();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptRef.current),
      MAX_RECONNECT_DELAY
    );
    return delay + Math.random() * 1000;
  }, []);

  const invalidateDeviceQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    queryClient.invalidateQueries({ queryKey: ["leds"] });
    queryClient.invalidateQueries({ queryKey: ["thermostats"] });
    queryClient.invalidateQueries({ queryKey: ["locks"] });
    queryClient.invalidateQueries({ queryKey: ["sensors"] });
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    setWsStatus("connecting");

    try {
      const ws = new WebSocket(`${WS_URL}/ws`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setStatus("connected");
        setWsStatus("connected");
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          const uuid = data.uuid as string | undefined;
          
          switch (data.type) {
            case "device_state_changed":
              invalidateDeviceQueries();
              if (uuid) {
                setDeviceLastSeen(uuid, new Date());
              }
              break;
            case "device_online":
              if (uuid) {
                setDeviceOnline(uuid, true);
                toast("success", `Dispositivo en línea`);
              }
              invalidateDeviceQueries();
              break;
            case "device_offline":
              if (uuid) {
                setDeviceOnline(uuid, false);
                toast("error", `Dispositivo desconectado`);
              }
              invalidateDeviceQueries();
              break;
            case "notification":
              toast("success", data.payload.message as string || "Nueva notificación");
              break;
          }
        } catch {
          console.error("Failed to parse WebSocket message");
        }
      };

      ws.onerror = () => {
        console.error("WebSocket error");
        setStatus("error");
        setWsStatus("error");
      };

      ws.onclose = () => {
        wsRef.current = null;
        setStatus("disconnected");
        setWsStatus("disconnected");
        
        if (isAuthenticated) {
          reconnectAttemptRef.current++;
          const delay = getReconnectDelay();
          console.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch {
      console.error("Failed to create WebSocket connection");
      setStatus("error");
      setWsStatus("error");
    }
  }, [isAuthenticated, invalidateDeviceQueries, toast, setDeviceOnline, setDeviceLastSeen, setWsStatus, getReconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
    setWsStatus("disconnected");
  }, [setWsStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  return { connect, disconnect, status };
}
