package com.limitbeyond.service;

import com.limitbeyond.model.User;
import java.util.List;
import java.util.Map;

public interface NotificationService {
    /**
     * Create a workout suggestion notification for a user
     */
    void createWorkoutSuggestion(User user, String message, Map<String, Object> data);

    /**
     * Get pending workout suggestions for a user
     */
    List<Map<String, Object>> getPendingWorkoutSuggestions(User user);

    /**
     * Mark a suggestion as read/seen
     */
    void markSuggestionAsSeen(String suggestionId);
}