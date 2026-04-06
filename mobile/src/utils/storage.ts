import { MMKV } from 'react-native-mmkv';

let storage: any;

try {
  storage = new MMKV();
} catch (e) {
  console.warn('MMKV native module not found. Falling back to memory storage. Data will not persist across app restarts.');
  
  // Basic memory storage fallback for non-native environments (Expo Go / Web)
  const memoryStorage = new Map<string, any>();
  
  storage = {
    set: (key: string, value: string | number | boolean | Uint8Array) => {
      memoryStorage.set(key, value);
    },
    getString: (key: string) => {
      const val = memoryStorage.get(key);
      return typeof val === 'string' ? val : undefined;
    },
    getNumber: (key: string) => {
      const val = memoryStorage.get(key);
      return typeof val === 'number' ? val : undefined;
    },
    getBoolean: (key: string) => {
      const val = memoryStorage.get(key);
      return typeof val === 'boolean' ? val : undefined;
    },
    delete: (key: string) => memoryStorage.delete(key),
    clearAll: () => memoryStorage.clear(),
    contains: (key: string) => memoryStorage.has(key),
    getAllKeys: () => Array.from(memoryStorage.keys()),
  };
}

export { storage };

export const storageUtils = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },

  getItem: (key: string): string | undefined => {
    return storage.getString(key);
  },

  setObject: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },

  removeItem: (key: string) => {
    storage.delete(key);
  },

  clear: () => {
    storage.clearAll();
  },

  hasKey: (key: string): boolean => {
    return storage.contains(key);
  },
};
