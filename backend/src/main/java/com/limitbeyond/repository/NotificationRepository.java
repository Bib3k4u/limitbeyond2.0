package com.limitbeyond.repository;

import com.limitbeyond.model.WorkoutNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<WorkoutNotification, String> {
    List<WorkoutNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<WorkoutNotification> findByUserIdAndSeenOrderByCreatedAtDesc(String userId, boolean seen);
}