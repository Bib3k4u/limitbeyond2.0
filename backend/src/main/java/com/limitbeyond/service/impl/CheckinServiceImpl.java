package com.limitbeyond.service.impl;

import com.limitbeyond.model.Checkin;
import com.limitbeyond.repository.CheckinRepository;
import com.limitbeyond.service.CheckinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CheckinServiceImpl implements CheckinService {

    @Autowired
    private CheckinRepository checkinRepository;

    @Override
    public Checkin addCheckin(String userId, LocalDateTime occurredAt) {
        Checkin c = new Checkin();
        c.setUserId(userId);
        c.setOccurredAt(occurredAt == null ? LocalDateTime.now() : occurredAt);
        return checkinRepository.save(c);
    }

    @Override
    public List<Checkin> getRecentCheckins(int limit) {
        // Simple implementation: return all ordered and let caller limit
        return checkinRepository.findByOccurredAtBetweenOrderByOccurredAtDesc(LocalDateTime.now().minusYears(10),
                LocalDateTime.now());
    }

    @Override
    public List<Checkin> getCheckinsBetween(LocalDateTime start, LocalDateTime end) {
        return checkinRepository.findByOccurredAtBetweenOrderByOccurredAtDesc(start, end);
    }

    @Override
    public List<Checkin> getRecentCheckinsForUser(String userId, int limit) {
        List<Checkin> all = checkinRepository.findByUserIdOrderByOccurredAtDesc(userId);
        if (all == null)
            return java.util.Collections.emptyList();
        return all.stream().limit(limit).toList();
    }

    @Override
    public List<Checkin> getCheckinsBetweenForUser(String userId, LocalDateTime start, LocalDateTime end) {
        return checkinRepository.findByUserIdAndOccurredAtBetweenOrderByOccurredAtDesc(userId, start, end);
    }
}
