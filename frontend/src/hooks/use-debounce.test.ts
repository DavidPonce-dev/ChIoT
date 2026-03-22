import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/use-debounce';
import { useState } from 'react';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState('initial');
      const debouncedValue = useDebounce(value, 500);
      return { value, debouncedValue };
    });

    expect(result.current.value).toBe('initial');
    expect(result.current.debouncedValue).toBe('initial');
  });
});
