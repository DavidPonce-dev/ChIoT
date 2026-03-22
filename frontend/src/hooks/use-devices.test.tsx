import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDevices, useDeleteDevice } from '@/hooks/use-devices';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    ledStrips: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    thermostats: {
      list: vi.fn(),
      create: vi.fn(),
      setTemp: vi.fn(),
      setMode: vi.fn(),
      delete: vi.fn(),
    },
    locks: {
      list: vi.fn(),
      create: vi.fn(),
      lock: vi.fn(),
      unlock: vi.fn(),
      delete: vi.fn(),
    },
    sensors: {
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";
  return Wrapper;
};

describe('useDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all devices', async () => {
    const mockLeds = [{ uuid: '1', name: 'LED 1', type: 'LED_STRIP', state: {} }];
    const mockThermostats = [{ uuid: '2', name: 'Thermostat 1', type: 'thermostat', state: {} }];
    const mockLocks = [{ uuid: '3', name: 'Lock 1', type: 'smart_lock', state: {} }];
    const mockSensors = [{ uuid: '4', name: 'Sensor 1', type: 'sensor', state: {} }];

    vi.mocked(api.ledStrips.list).mockResolvedValueOnce(mockLeds as never);
    vi.mocked(api.thermostats.list).mockResolvedValueOnce(mockThermostats as never);
    vi.mocked(api.locks.list).mockResolvedValueOnce(mockLocks as never);
    vi.mocked(api.sensors.list).mockResolvedValueOnce(mockSensors as never);

    const { result } = renderHook(() => useDevices(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.devices).toHaveLength(4);
    expect(result.current.leds).toEqual(mockLeds);
  });

  it('should return refetch function', async () => {
    const { result } = renderHook(() => useDevices(), { wrapper: createWrapper() });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useDeleteDevice', () => {
  it('should have delete mutation available', () => {
    const { result } = renderHook(() => useDeleteDevice(), { wrapper: createWrapper() });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
  });
});
