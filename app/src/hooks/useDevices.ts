import {useState, useEffect} from 'react';
import {deviceService} from '../services/api';

interface BaseDevice {
  uuid: string;
  name: string;
  type: string;
  owner: string | null;
  state: Record<string, unknown>;
}

type Device = BaseDevice;

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [leds, thermostats, locks, sensors] = await Promise.all([
        deviceService.ledStrips.list(),
        deviceService.thermostats.list(),
        deviceService.locks.list(),
        deviceService.sensors.list(),
      ]);
      setDevices([...leds, ...thermostats, ...locks, ...sensors]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return {devices, loading, error, refetch: fetchDevices};
}
