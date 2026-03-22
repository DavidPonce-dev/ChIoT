"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { SensorDevice } from "@/lib/api";
import { useEffect, useState } from "react";

export interface SensorChartProps {
  device: SensorDevice;
}

interface ChartDataPoint {
  time: string;
  temperature: number | null;
  humidity: number | null;
}

export default function SensorChart({ device }: SensorChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const mockHistory = generateMockHistory(device);
    setChartData(mockHistory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.uuid, device.state.temperature, device.state.humidity]);

  if (chartData.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-[var(--muted-foreground)] text-sm">
        Cargando historial...
      </div>
    );
  }

  const hasTemp = chartData.some((d) => d.temperature !== null);
  const hasHumidity = chartData.some((d) => d.humidity !== null);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--muted-foreground)] mb-2">Historial (últimas 24h)</p>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} 
              tickLine={false}
              axisLine={false}
              domain={hasTemp && hasHumidity ? [0, 100] : ["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            {hasTemp && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Temperatura (°C)"
              />
            )}
            {hasHumidity && (
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Humedad (%)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function generateMockHistory(device: SensorDevice): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];
  const temp = device.state.temperature ?? 22;
  const humidity = device.state.humidity ?? 50;

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      temperature: temp + (Math.random() - 0.5) * 4,
      humidity: humidity + (Math.random() - 0.5) * 10,
    });
  }

  return data;
}
