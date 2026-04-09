import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { mswServer } from './msw/server';

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: 'bypass' });
});
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());

/** In-memory Storage — some Node/Vitest combos expose a broken `localStorage`. */
const memory = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return memory.size;
  },
  clear: () => memory.clear(),
  getItem: (key) => (memory.has(key) ? memory.get(key)! : null),
  key: (index) => [...memory.keys()][index] ?? null,
  removeItem: (key) => {
    memory.delete(key);
  },
  setItem: (key, value) => {
    memory.set(key, value);
  },
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true });
