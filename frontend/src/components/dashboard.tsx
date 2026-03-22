"use client";

import { useState } from "react";
import { LedStripCard } from "./devices/led-strip-card";
import { ThermostatCard } from "./devices/thermostat-card";
import { SmartLockCard } from "./devices/smart-lock-card";
import { SensorCard } from "./devices/sensor-card";
import { AddDeviceModal } from "./modals/add-device-modal";
import { Navbar } from "./navbar";
import { useDevices } from "@/hooks/use-devices";
import { Loader2, Plus } from "lucide-react";

type DeviceType = "LED_STRIP" | "thermostat" | "smart_lock" | "sensor";

export function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { devices, isLoading, error, refetch } = useDevices();
  const [filter, setFilter] = useState<DeviceType | "all">("all");

  const filteredDevices = devices.filter(
    (d) => filter === "all" || d.type === filter
  );

  const groupedDevices = {
    LED_STRIP: filteredDevices.filter((d) => d.type === "LED_STRIP"),
    thermostat: filteredDevices.filter((d) => d.type === "thermostat"),
    smart_lock: filteredDevices.filter((d) => d.type === "smart_lock"),
    sensor: filteredDevices.filter((d) => d.type === "sensor"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dispositivos</h1>
            <p className="text-[var(--muted-foreground)]">
              {devices.length} dispositivo{devices.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Agregar Dispositivo
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todos
          </FilterButton>
          <FilterButton
            active={filter === "LED_STRIP"}
            onClick={() => setFilter("LED_STRIP")}
          >
            LED
          </FilterButton>
          <FilterButton
            active={filter === "thermostat"}
            onClick={() => setFilter("thermostat")}
          >
            Termostatos
          </FilterButton>
          <FilterButton
            active={filter === "smart_lock"}
            onClick={() => setFilter("smart_lock")}
          >
            Cerraduras
          </FilterButton>
          <FilterButton
            active={filter === "sensor"}
            onClick={() => setFilter("sensor")}
          >
            Sensores
          </FilterButton>
        </div>

        {devices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sin dispositivos</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              Agrega tu primer dispositivo para comenzar
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg font-medium"
            >
              Agregar Dispositivo
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {groupedDevices.LED_STRIP.length > 0 && (
              <DeviceSection title="Tiras LED">
                {groupedDevices.LED_STRIP.map((device) => (
                  <LedStripCard key={device.uuid} device={device} />
                ))}
              </DeviceSection>
            )}

            {groupedDevices.thermostat.length > 0 && (
              <DeviceSection title="Termostatos">
                {groupedDevices.thermostat.map((device) => (
                  <ThermostatCard key={device.uuid} device={device} />
                ))}
              </DeviceSection>
            )}

            {groupedDevices.smart_lock.length > 0 && (
              <DeviceSection title="Cerraduras Inteligentes">
                {groupedDevices.smart_lock.map((device) => (
                  <SmartLockCard key={device.uuid} device={device} />
                ))}
              </DeviceSection>
            )}

            {groupedDevices.sensor.length > 0 && (
              <DeviceSection title="Sensores">
                {groupedDevices.sensor.map((device) => (
                  <SensorCard key={device.uuid} device={device} />
                ))}
              </DeviceSection>
            )}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddDeviceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-[var(--primary)] text-white"
          : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/80"
      }`}
    >
      {children}
    </button>
  );
}

function DeviceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}
