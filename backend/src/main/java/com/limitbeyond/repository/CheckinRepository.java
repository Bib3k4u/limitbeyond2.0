package com.limitbeyond.repository;

import com.limitbeyond.model.Checkin;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CheckinRepository extends MongoRepository<Checkin, String> {
    List<Checkin> findByUserIdOrderByOccurredAtDesc(String userId);

    List<Checkin> findByOccurredAtBetweenOrderByOccurredAtDesc(LocalDateTime start, LocalDateTime end);

    List<Checkin> findByUserIdAndOccurredAtBetweenOrderByOccurredAtDesc(String userId, LocalDateTime start,
            LocalDateTime end);
}
