import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

// Mock de IndexedDB
class MockIndexedDB {
  open() {
    return {
      onsuccess: undefined,
      onerror: undefined,
    };
  }
}

if (!window.indexedDB) {
  window.indexedDB = new MockIndexedDB() as any;
}

// Mock de navigator.vibrate
if (!navigator.vibrate) {
  navigator.vibrate = vi.fn();
}

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
