package com.limitbeyond.config;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    /**
     * Primary API cache (AI suggestions, workout data, etc.)
     * Increased from 1000 to 10000 entries; TTL 15 minutes for AI suggestions.
     */
    @Bean(name = "apiCache")
    public Cache<String, Object> cache() {
        return CacheBuilder.newBuilder()
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .maximumSize(10000)
                .build();
    }

    /**
     * User lookup cache with a shorter TTL of 5 minutes.
     * Used for caching UserDetails and User objects by username/id.
     */
    @Bean(name = "userCache")
    public Cache<String, Object> userCache() {
        return CacheBuilder.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build();
    }
}
