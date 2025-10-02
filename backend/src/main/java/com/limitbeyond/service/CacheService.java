package com.limitbeyond.service;

import com.google.common.cache.Cache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class CacheService {

    private final Cache<String, Object> cache;

    @Autowired
    public CacheService(@Qualifier("apiCache") Cache<String, Object> cache) {
        this.cache = cache;
    }

    public void put(String key, Object value) {
        cache.put(key, value);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        return (T) cache.getIfPresent(key);
    }

    public void invalidate(String key) {
        cache.invalidate(key);
    }

    public void invalidateAll() {
        cache.invalidateAll();
    }
}