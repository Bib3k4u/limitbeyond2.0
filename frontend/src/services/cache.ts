type CacheEntry = {
  value: any;
  expiresAt: number | null;
};

const store: Record<string, CacheEntry> = {};
const LS_PREFIX = 'lb_c_';

export const cache = {
  get: (key: string) => {
    // 1. memory hit
    const e = store[key];
    if (e) {
      if (!e.expiresAt || Date.now() <= e.expiresAt) return e.value;
      delete store[key];
    }
    // 2. localStorage hit (survives page refresh)
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (raw) {
        const parsed: CacheEntry = JSON.parse(raw);
        if (!parsed.expiresAt || Date.now() <= parsed.expiresAt) {
          store[key] = parsed; // warm memory while we're here
          return parsed.value;
        }
        localStorage.removeItem(LS_PREFIX + key);
      }
    } catch {}
    return null;
  },

  set: (key: string, value: any, ttlMs?: number, persist = false) => {
    const expiresAt = ttlMs ? Date.now() + ttlMs : null;
    store[key] = { value, expiresAt };
    if (persist) {
      try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify({ value, expiresAt }));
      } catch {}
    }
  },

  del: (key: string) => {
    delete store[key];
    try { localStorage.removeItem(LS_PREFIX + key); } catch {}
  },

  clear: (prefix?: string) => {
    if (!prefix) {
      Object.keys(store).forEach(k => delete store[k]);
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(LS_PREFIX))
          .forEach(k => localStorage.removeItem(k));
      } catch {}
      return;
    }
    Object.keys(store).forEach(k => { if (k.startsWith(prefix)) delete store[k]; });
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(LS_PREFIX + prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }
};

export default cache;
