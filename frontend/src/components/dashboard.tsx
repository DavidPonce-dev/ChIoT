"use client";

import { useState, useMemo, Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import { AddDeviceModal } from "./modals/add-device-modal";
import { Navbar } from "./navbar";
import { useDevices } from "@/hooks/use-devices";
import { useDebounce } from "@/hooks/use-debounce";
import { DashboardSkeleton } from "./ui/skeleton";
import { Search, Plus } from "lucide-react";

const LedStripCard = dynamic(() => import("./devices/led-strip-card").then((mod) => mod.LedStripCard), {
  ssr: false,
  loading: () => <div className="h-48 bg-[var(--card)] rounded-xl animate-pulse" />,
});

const ThermostatCard = dynamic(() => import("./devices/thermostat-card").then((mod) => mod.ThermostatCard), {
  ssr: false,
  loading: () => <div className="h-64 bg-[var(--card)] rounded-xl animate-pulse" />,
});

const SmartLockCard = dynamic(() => import("./devices/smart-lock-card").then((mod) => mod.SmartLockCard), {
  ssr: false,
  loading: () => <div className="h-56 bg-[var(--card)] rounded-xl animate-pulse" />,
});

const SensorCard = dynamic(() => import("./devices/sensor-card").then((mod) => mod.SensorCard), {
  ssr: false,
  loading: () => <div className="h-56 bg-[var(--card)] rounded-xl animate-pulse" />,
});

type DeviceType = "led_strip" | "thermostat" | "smart_lock" | "sensor";

export function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { devices, isLoading, refetch } = useDevices();
  const [filter, setFilter] = useState<DeviceType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredDevices = useMemo(() => {
    let result = devices;

    if (filter !== "all") {
      result = result.filter((d) => d.type === filter);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(query));
    }

    return result;
  }, [devices, filter, debouncedSearch]);

  const groupedDevices = {
    led_strip: filteredDevices.filter((d) => d.type === "led_strip"),
    thermostat: filteredDevices.filter((d) => d.type === "thermostat"),
    smart_lock: filteredDevices.filter((d) => d.type === "smart_lock"),
    sensor: filteredDevices.filter((d) => d.type === "sensor"),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  const hasDevices = devices.length > 0;
  const hasFilteredDevices = filteredDevices.length > 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dispositivos</h1>
            <p className="text-[var(--muted-foreground)]">
              {hasDevices
                ? `${devices.length} dispositivo${devices.length !== 1 ? "s" : ""}`
                : "Sin dispositivos"}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar
          </button>
        </div>

        {hasDevices && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Buscar dispositivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                Todos
              </FilterButton>
              <FilterButton active={filter === "led_strip"} onClick={() => setFilter("led_strip")}>
                LED
              </FilterButton>
              <FilterButton active={filter === "thermostat"} onClick={() => setFilter("thermostat")}>
                Termostatos
              </FilterButton>
              <FilterButton active={filter === "smart_lock"} onClick={() => setFilter("smart_lock")}>
                Cerraduras
              </FilterButton>
              <FilterButton active={filter === "sensor"} onClick={() => setFilter("sensor")}>
                Sensores
              </FilterButton>
            </div>
          </div>
        )}

        {!hasDevices ? (
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
              className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-lg font-medium transition-colors"
            >
              Agregar Dispositivo
            </button>
          </div>
        ) : !hasFilteredDevices ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sin resultados</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              No se encontraron dispositivos para &quot;{debouncedSearch}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              className="px-6 py-2 bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 rounded-lg font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedDevices.led_strip.length > 0 && (
              <DeviceSection title="Tiras LED">
                {groupedDevices.led_strip.map((device) => (
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
        <AddDeviceModal onClose={() => setShowAddModal(false)} onSuccess={refetch} />
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
