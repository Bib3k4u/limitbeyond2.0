package com.limitbeyond.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

        @GetMapping({ "", "/" })
        public ResponseEntity<String> healthCheck() {
                return ResponseEntity.ok("OK");
        }

        @RequestMapping(value = { "", "/" }, method = RequestMethod.OPTIONS)
        public ResponseEntity<Void> healthCheckOptions() {
                return ResponseEntity.ok().build();
        }
}
