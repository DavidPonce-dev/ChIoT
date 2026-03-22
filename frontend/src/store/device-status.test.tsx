import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeviceStatusStore } from '@/store/device-status';

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
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
};

describe('useDeviceStatusStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDeviceStatusStore.setState({ deviceStatuses: {} });
  });

  it('should set device online status', () => {
    const { setDeviceOnline } = useDeviceStatusStore.getState();
    
    setDeviceOnline('device-1', true);
    
    expect(useDeviceStatusStore.getState().deviceStatuses['device-1']).toEqual({
      uuid: 'device-1',
      online: true,
      lastSeen: expect.any(Date),
    });
  });

  it('should set device offline status', () => {
    const { setDeviceOnline } = useDeviceStatusStore.getState();
    
    setDeviceOnline('device-1', true);
    setDeviceOnline('device-1', false);
    
    expect(useDeviceStatusStore.getState().isDeviceOnline('device-1')).toBe(false);
  });

  it('should return device status', () => {
    const { setDeviceOnline, getDeviceStatus } = useDeviceStatusStore.getState();
    
    setDeviceOnline('device-1', true);
    const status = getDeviceStatus('device-1');
    
    expect(status).toBeDefined();
    expect(status?.online).toBe(true);
  });

  it('should return undefined for non-existent device', () => {
    const { getDeviceStatus } = useDeviceStatusStore.getState();
    
    expect(getDeviceStatus('non-existent')).toBeUndefined();
  });

  it('should check if device is online', () => {
    const { setDeviceOnline, isDeviceOnline } = useDeviceStatusStore.getState();
    
    setDeviceOnline('device-1', true);
    
    expect(isDeviceOnline('device-1')).toBe(true);
    expect(isDeviceOnline('device-2')).toBe(false);
  });
});
