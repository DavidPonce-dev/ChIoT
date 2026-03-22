import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useThemeStore, getEffectiveTheme, type Theme } from '@/store/theme';

const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  Wrapper.displayName = 'Wrapper';
  return Wrapper;
};

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useThemeStore.setState({ theme: 'system' });
  });

  it('should have default system theme', () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe('system');
  });

  it('should set theme to light', () => {
    const { setTheme } = useThemeStore.getState();
    
    setTheme('light');
    
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('should set theme to dark', () => {
    const { setTheme } = useThemeStore.getState();
    
    setTheme('dark');
    
    expect(useThemeStore.getState().theme).toBe('dark');
  });
});

describe('getEffectiveTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it('should return light when theme is light', () => {
    expect(getEffectiveTheme('light')).toBe('light');
  });

  it('should return dark when theme is dark', () => {
    expect(getEffectiveTheme('dark')).toBe('dark');
  });

  it('should return system theme preference', () => {
    const result = getEffectiveTheme('system');
    expect(['light', 'dark']).toContain(result);
  });
});
