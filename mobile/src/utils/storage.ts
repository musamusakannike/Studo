import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

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
