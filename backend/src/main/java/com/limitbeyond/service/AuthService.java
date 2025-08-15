package com.limitbeyond.service;

import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        // Validate username and email don't exist
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Set trainer accounts as inactive by default
        Set<Role> roles = user.getRoles();
        if (roles != null && roles.contains(Role.TRAINER)) {
            user.setActive(false);
        } else {
            // Non-trainers are active by default
            user.setActive(true);
        }

        return userRepository.save(user);
    }

    public User activateTrainer(String trainerId) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        Set<Role> roles = trainer.getRoles();
        if (roles == null || !roles.contains(Role.TRAINER)) {
            throw new RuntimeException("User is not a trainer");
        }

        trainer.setActive(true);
        return userRepository.save(trainer);
    }
}