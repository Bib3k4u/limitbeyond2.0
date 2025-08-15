package com.limitbeyond.service;

import com.limitbeyond.model.Checkin;
import java.time.LocalDateTime;
import java.util.List;

public interface CheckinService {
    Checkin addCheckin(String userId, LocalDateTime occurredAt);

    List<Checkin> getRecentCheckins(int limit);

    List<Checkin> getCheckinsBetween(LocalDateTime start, LocalDateTime end);

    List<Checkin> getRecentCheckinsForUser(String userId, int limit);

    List<Checkin> getCheckinsBetweenForUser(String userId, LocalDateTime start, LocalDateTime end);
}
