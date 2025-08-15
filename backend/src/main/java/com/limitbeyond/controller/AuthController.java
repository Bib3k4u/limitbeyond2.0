package com.limitbeyond.controller;

import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.payload.JwtAuthenticationResponse;
import com.limitbeyond.payload.LoginRequest;
import com.limitbeyond.payload.SignupRequest;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.security.JwtTokenProvider;
import com.limitbeyond.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
        } catch (Exception e) {
            logger.error("Error during authentication: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            // Check if username exists
            if (userRepository.existsByUsername(signupRequest.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username is already taken"));
            }

            // Check if email exists
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is already in use"));
            }

            // Convert SignupRequest to User
            User user = new User();
            user.setUsername(signupRequest.getUsername());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            user.setEmail(signupRequest.getEmail());
            user.setFirstName(signupRequest.getFirstName());
            user.setLastName(signupRequest.getLastName());
            user.setPhoneNumber(signupRequest.getPhoneNumber());

            // Set roles
            Set<Role> roles = new HashSet<>();
            try {
                roles.add(Role.valueOf(signupRequest.getRole()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
            }
            user.setRoles(roles);

            // Make non-trainers active by default
            if (!roles.contains(Role.TRAINER) && !roles.contains(Role.MEMBER)) {
                user.setActive(true);
            }

            // Register user
            User registeredUser = userRepository.save(user);

            // Generate token for active users
            if (registeredUser.isActive()) {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                signupRequest.getUsername(),
                                signupRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.generateToken(authentication);

                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                response.put("message", "User registered successfully");
                return ResponseEntity.ok(response);
            }

            // For inactive users (trainers), return success without token
            return ResponseEntity.ok(Map.of(
                    "message", "Registration successful. For trainer accounts, please wait for admin approval."));

        } catch (Exception e) {
            logger.error("Error during registration: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}