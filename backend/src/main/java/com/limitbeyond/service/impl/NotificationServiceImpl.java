package com.limitbeyond.service.impl;

import com.limitbeyond.model.WorkoutNotification;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.NotificationRepository;
import com.limitbeyond.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void createWorkoutSuggestion(User user, String message, Map<String, Object> data) {
        WorkoutNotification notification = new WorkoutNotification(
                user.getId(),
                message,
                data,
                "WORKOUT_SUGGESTION");
        notificationRepository.save(notification);
    }

    @Override
    public List<Map<String, Object>> getPendingWorkoutSuggestions(User user) {
        return notificationRepository.findByUserIdAndSeenOrderByCreatedAtDesc(user.getId(), false)
                .stream()
                .map(notification -> {
                    Map<String, Object> response = notification.getData();
                    response.put("id", notification.getId());
                    response.put("message", notification.getMessage());
                    response.put("createdAt", notification.getCreatedAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void markSuggestionAsSeen(String suggestionId) {
        notificationRepository.findById(suggestionId).ifPresent(notification -> {
            notification.setSeen(true);
            notificationRepository.save(notification);
        });
    }
}