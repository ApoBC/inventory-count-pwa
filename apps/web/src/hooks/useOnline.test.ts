import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnline } from './useOnline';

describe('useOnline hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar true cuando navigator.onLine es true', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOnline());

    expect(result.current).toBe(true);
  });

  it('debe retornar false cuando navigator.onLine es false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnline());

    expect(result.current).toBe(false);
  });

  it('debe actualizar estado cuando se dispara evento online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('debe actualizar estado cuando se dispara evento offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });
});
