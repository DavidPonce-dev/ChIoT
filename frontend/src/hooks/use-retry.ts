"use client";

import { useState, useCallback } from "react";

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

interface RetryState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
  retryCount: number;
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): RetryState<T> & { execute: () => Promise<void>; reset: () => void } {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  const [state, setState] = useState<RetryState<T>>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        setState({
          data: result,
          isLoading: false,
          error: null,
          retryCount: attempt,
        });
        return;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          onRetry?.(attempt + 1, err);
          await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: lastError,
    }));
  }, [fn, maxRetries, delay, onRetry]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      retryCount: 0,
    });
  }, []);

  return { ...state, execute, reset };
}
