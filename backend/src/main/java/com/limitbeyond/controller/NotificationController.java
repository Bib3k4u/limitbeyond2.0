package com.limitbeyond.controller;

import com.limitbeyond.service.NotificationService;
import com.limitbeyond.service.UserService;
import com.limitbeyond.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    private User getCurrentUserOrThrow() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/workout-suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getWorkoutSuggestions() {
        User currentUser = getCurrentUserOrThrow();
        List<Map<String, Object>> suggestions = notificationService.getPendingWorkoutSuggestions(currentUser);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/suggestions/{id}/seen")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markSuggestionAsSeen(@PathVariable String id) {
        notificationService.markSuggestionAsSeen(id);
        return ResponseEntity.ok().build();
    }
}