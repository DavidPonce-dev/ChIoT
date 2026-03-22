import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/store/auth';

const mockMe = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      me: (...args: unknown[]) => mockMe(...args),
      logout: (...args: unknown[]) => mockLogout(...args),
    },
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMe.mockReset();
    mockLogout.mockReset();
    
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set user and isAuthenticated when setUser is called', () => {
    const { result } = renderHook(() => useAuthStore());
    const testUser = { id: '1', email: 'test@example.com' };

    act(() => {
      result.current.setUser(testUser);
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear user and isAuthenticated when setUser is called with null', () => {
    const { result } = renderHook(() => useAuthStore());
    const testUser = { id: '1', email: 'test@example.com' };

    act(() => {
      result.current.setUser(testUser);
    });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.setUser(null);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set isAuthenticated to true after successful checkAuth', async () => {
    mockMe.mockResolvedValueOnce({ user: { _id: '123', email: 'test@example.com' } });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.checkAuth();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({ id: '123', email: 'test@example.com' });
    });
  });

  it('should keep isAuthenticated false after failed checkAuth', async () => {
    mockMe.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.checkAuth();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should logout successfully', async () => {
    mockLogout.mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setUser({ id: '1', email: 'test@test.com' });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
