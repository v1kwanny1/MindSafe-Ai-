// Memory fallback store if localStorage is blocked by iframe third-party security cookie rules
const memoryStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not read ${key} from localStorage, using memory store fallback:`, e);
    }
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      memoryStore[key] = value;
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not write ${key} to localStorage, stored in memory:`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      delete memoryStore[key];
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] Could not remove ${key} from localStorage:`, e);
    }
  }
};
