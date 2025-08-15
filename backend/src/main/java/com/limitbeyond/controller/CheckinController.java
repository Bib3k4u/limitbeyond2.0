package com.limitbeyond.controller;

import com.limitbeyond.model.Checkin;
import com.limitbeyond.service.CheckinService;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.model.User;
import com.limitbeyond.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/checkins")
public class CheckinController {

    @Autowired
    private CheckinService checkinService;

    @Autowired
    private UserRepository userRepository;

    // Any authenticated user can create a checkin for themselves; admin can create
    // for any user
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Checkin> addCheckin(@RequestParam String userId,
            @RequestParam(required = false) String occurredAt) {
        LocalDateTime ts = null;
        if (occurredAt != null && !occurredAt.isEmpty()) {
            ts = LocalDateTime.parse(occurredAt);
        }
        Checkin created = checkinService.addCheckin(userId, ts);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/recent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Checkin>> recentCheckins(
            @RequestParam(required = false, defaultValue = "50") int limit,
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        // If ADMIN, return global recent or for provided userId
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ROLE_ADMIN"));
        boolean isTrainer = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ROLE_TRAINER"));
        String authId = null;
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            authId = ((UserPrincipal) authentication.getPrincipal()).getId();
        } else {
            authId = authentication.getName();
        }

        if (isAdmin) {
            if (userId == null || userId.isEmpty())
                return ResponseEntity.ok(checkinService.getRecentCheckins(limit));
            return ResponseEntity.ok(checkinService.getRecentCheckinsForUser(userId, limit));
        }

        // Trainers can request their assigned member's checkins
        if (isTrainer && userId != null && !userId.isEmpty()) {
            User trainer = userRepository.findById(authId).orElse(null);
            if (trainer != null && trainer.getAssignedMembers() != null
                    && trainer.getAssignedMembers().contains(userId)) {
                return ResponseEntity.ok(checkinService.getRecentCheckinsForUser(userId, limit));
            } else {
                return ResponseEntity.status(403).build();
            }
        }

        // Default: return only the authenticated user's recent checkins
        return ResponseEntity.ok(checkinService.getRecentCheckinsForUser(authId, limit));
    }

    @GetMapping("/between")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Checkin>> checkinsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String userId,
            Authentication authentication) {
        LocalDateTime s = LocalDateTime.of(start, LocalTime.MIN);
        LocalDateTime e = LocalDateTime.of(end, LocalTime.MAX);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ROLE_ADMIN"));
        boolean isTrainer = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().contains("ROLE_TRAINER"));
        String authId = null;
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            authId = ((UserPrincipal) authentication.getPrincipal()).getId();
        } else {
            authId = authentication.getName();
        }

        if (isAdmin) {
            if (userId == null || userId.isEmpty())
                return ResponseEntity.ok(checkinService.getCheckinsBetween(s, e));
            return ResponseEntity.ok(checkinService.getCheckinsBetweenForUser(userId, s, e));
        }

        if (isTrainer && userId != null && !userId.isEmpty()) {
            User trainer = userRepository.findById(authId).orElse(null);
            if (trainer != null && trainer.getAssignedMembers() != null
                    && trainer.getAssignedMembers().contains(userId)) {
                return ResponseEntity.ok(checkinService.getCheckinsBetweenForUser(userId, s, e));
            } else {
                return ResponseEntity.status(403).build();
            }
        }

        // Default: member sees only their own
        return ResponseEntity.ok(checkinService.getCheckinsBetweenForUser(authId, s, e));
    }
}
