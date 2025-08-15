package com.limitbeyond.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testSignup() throws Exception {
        Map<String, Object> signupRequest = new HashMap<>();
        signupRequest.put("username", "testadmin");
        signupRequest.put("email", "admin@test.com");
        signupRequest.put("password", "password123");
        signupRequest.put("firstName", "Test");
        signupRequest.put("lastName", "Admin");
        signupRequest.put("phoneNumber", "1234567890");
        signupRequest.put("role", "ADMIN");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testSignin() throws Exception {
        // Create a test user
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRoles(Collections.singleton(Role.ADMIN));
        user.setActive(true);
        userRepository.save(user);

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "testuser");
        loginRequest.put("password", "password123");

        mockMvc.perform(post("/api/auth/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}