package com.limitbeyond.controller;

import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "https://*.lovable.app",
        "https://*.lovable.dev"
}, allowedHeaders = {
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Access-Control-Allow-Origin"
}, methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS,
        RequestMethod.PATCH,
        RequestMethod.HEAD
}, allowCredentials = "true", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "User not authenticated");
                return ResponseEntity.status(401).body(response);
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/trainers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllTrainers() {
        List<User> trainers = userRepository.findByRolesContaining(Role.TRAINER);
        return ResponseEntity.ok(trainers);
    }

    @GetMapping("/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<List<User>> getAllMembers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> members;
        if (currentUser.getRoles().contains(Role.ADMIN)) {
            members = userRepository.findByRolesContaining(Role.MEMBER);
        } else {
            members = userRepository.findByRolesContainingAndActive(Role.MEMBER, true);
        }

        return ResponseEntity.ok(members);
    }

    @PutMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(true);
        userRepository.save(user);

        return ResponseEntity.ok("User activated successfully");
    }

    @PutMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        userRepository.save(user);

        return ResponseEntity.ok("User deactivated successfully");
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','TRAINER','MEMBER')")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/member/{memberId}/assign-trainer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignTrainerToMember(
            @PathVariable String memberId,
            @RequestBody Map<String, String> request) {

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        if (!member.getRoles().contains(Role.MEMBER)) {
            return ResponseEntity.badRequest().body("User is not a member");
        }

        String trainerId = request.get("trainerId");
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (!trainer.getRoles().contains(Role.TRAINER)) {
            return ResponseEntity.badRequest().body("Assigned user is not a trainer");
        }

        member.setAssignedTrainer(trainerId);
        trainer.getAssignedMembers().add(memberId);

        userRepository.save(member);
        userRepository.save(trainer);

        return ResponseEntity.ok("Trainer assigned successfully");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update basic profile information
            if (request.getFirstName() != null) {
                currentUser.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                currentUser.setLastName(request.getLastName());
            }
            if (request.getPhoneNumber() != null) {
                currentUser.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getEmail() != null) {
                currentUser.setEmail(request.getEmail());
            }

            // Update fitness profile
            if (request.getHeightCm() != null) {
                currentUser.setHeightCm(request.getHeightCm());
            }
            if (request.getLevel() != null) {
                currentUser.setLevel(request.getLevel());
            }
            if (request.getWeightKg() != null) {
                currentUser.setCurrentWeightKg(request.getWeightKg());
                java.util.List<User.WeightEntry> history = currentUser.getWeightHistory();
                if (history == null)
                    history = new java.util.ArrayList<>();
                history.add(new User.WeightEntry(System.currentTimeMillis(), request.getWeightKg()));
                currentUser.setWeightHistory(history);
            }

            userRepository.save(currentUser);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Add password validation logic here if needed
            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                throw new RuntimeException("New password cannot be empty");
            }

            // Update password (assuming you have a password encoder configured)
            currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(currentUser);

            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update password: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Request classes
    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private Double heightCm;
        private Double weightKg;
        private String level;

        // Getters
        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getEmail() {
            return email;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public Double getHeightCm() {
            return heightCm;
        }

        public Double getWeightKg() {
            return weightKg;
        }

        public String getLevel() {
            return level;
        }

        // Setters
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public void setHeightCm(Double heightCm) {
            this.heightCm = heightCm;
        }

        public void setWeightKg(Double weightKg) {
            this.weightKg = weightKg;
        }

        public void setLevel(String level) {
            this.level = level;
        }
    }

    public static class UpdatePasswordRequest {
        private String newPassword;

        // Getter
        public String getNewPassword() {
            return newPassword;
        }

        // Setter
        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}