package com.limitbeyond.controller;

import com.limitbeyond.service.AIWorkoutService;
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
@RequestMapping("/api/ai-workout")
public class AIWorkoutController {

    @Autowired
    private AIWorkoutService aiWorkoutService;

    @Autowired
    private UserService userService;

    private User getCurrentUserOrThrow() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/suggest/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getSuggestions(
            @PathVariable String exerciseId,
            @RequestParam(defaultValue = "30") int historyDays) {
        User currentUser = getCurrentUserOrThrow();
        Map<String, Object> suggestions = aiWorkoutService.getSuggestedParameters(currentUser, exerciseId, historyDays);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/weekly-suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getWeeklySuggestions() {
        User currentUser = getCurrentUserOrThrow();
        List<String> suggestions = aiWorkoutService.getWeeklyWorkoutSuggestions(currentUser);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/progressive-overload/{exerciseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getProgressiveOverloadSuggestions(
            @PathVariable String exerciseId) {
        User currentUser = getCurrentUserOrThrow();
        Map<String, Object> suggestions = aiWorkoutService.getProgressiveOverloadSuggestions(currentUser, exerciseId);
        return ResponseEntity.ok(suggestions);
    }
}