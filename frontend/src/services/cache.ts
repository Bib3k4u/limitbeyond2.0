type CacheEntry = {
  value: any;
  expiresAt: number | null;
};

const store: Record<string, CacheEntry> = {};

export const cache = {
  get: (key: string) => {
    const e = store[key];
    if (!e) return null;
    if (e.expiresAt && Date.now() > e.expiresAt) {
      delete store[key];
      return null;
    }
    return e.value;
  },

  set: (key: string, value: any, ttlMs?: number) => {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    store[key] = { value, expiresAt };
  },

  del: (key: string) => {
    delete store[key];
  },

  // clear all keys or keys with prefix
  clear: (prefix?: string) => {
    if (!prefix) {
      Object.keys(store).forEach(k => delete store[k]);
      return;
    }
    Object.keys(store).forEach(k => { if (k.startsWith(prefix)) delete store[k]; });
  }
};

export default cache;
