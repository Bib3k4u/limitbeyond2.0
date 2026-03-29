package com.limitbeyond;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = { "com.limitbeyond.gym", "com.limitbeyond.security", "com.limitbeyond" })
@EnableCaching
public class LimitBeyondApplication {
    public static void main(String[] args) {
        SpringApplication.run(LimitBeyondApplication.class, args);
    }
}