package com.limitbeyond.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.limitbeyond.model.Feedback;
import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.FeedbackRepository;
import com.limitbeyond.repository.UserRepository;
import com.limitbeyond.security.JwtTokenProvider;
import com.limitbeyond.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class FeedbackControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private FeedbackRepository feedbackRepository;

        @Autowired
        private JwtTokenProvider tokenProvider;

        @Autowired
        private PasswordEncoder passwordEncoder;

        private String memberToken;
        private String trainerToken;
        private User memberUser;
        private User trainerUser;

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();
                feedbackRepository.deleteAll();

                // Create member user
                memberUser = new User();
                memberUser.setUsername("member");
                memberUser.setPassword(passwordEncoder.encode("password"));
                memberUser.setEmail("member@test.com");
                memberUser.setRoles(Collections.singleton(Role.MEMBER));
                memberUser.setActive(true);
                userRepository.save(memberUser);

                // Create trainer user
                trainerUser = new User();
                trainerUser.setUsername("trainer");
                trainerUser.setPassword(passwordEncoder.encode("password"));
                trainerUser.setEmail("trainer@test.com");
                trainerUser.setRoles(Collections.singleton(Role.TRAINER));
                trainerUser.setActive(true);
                userRepository.save(trainerUser);

                // Generate tokens using UserPrincipal
                UserPrincipal memberPrincipal = UserPrincipal.create(memberUser);
                Authentication memberAuth = new UsernamePasswordAuthenticationToken(
                                memberPrincipal,
                                null,
                                memberPrincipal.getAuthorities());
                memberToken = tokenProvider.generateToken(memberAuth);

                UserPrincipal trainerPrincipal = UserPrincipal.create(trainerUser);
                Authentication trainerAuth = new UsernamePasswordAuthenticationToken(
                                trainerPrincipal,
                                null,
                                trainerPrincipal.getAuthorities());
                trainerToken = tokenProvider.generateToken(trainerAuth);
        }

        @Test
        void testCreateFeedback() throws Exception {
                Map<String, String> request = new HashMap<>();
                request.put("title", "Test Feedback");
                request.put("content", "This is a test feedback");

                mockMvc.perform(post("/api/feedback")
                                .header("Authorization", "Bearer " + memberToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk());

                // Trainer should not be able to create feedback
                mockMvc.perform(post("/api/feedback")
                                .header("Authorization", "Bearer " + trainerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testGetFeedback() throws Exception {
                // Create a feedback
                Feedback feedback = new Feedback();
                feedback.setMemberId(memberUser.getId());
                feedback.setTitle("Test Feedback");
                feedback.setContent("This is a test feedback");
                feedbackRepository.save(feedback);

                // Member can view their feedback
                mockMvc.perform(get("/api/feedback")
                                .header("Authorization", "Bearer " + memberToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].title").value("Test Feedback"));

                // Trainer can view all feedback
                mockMvc.perform(get("/api/feedback")
                                .header("Authorization", "Bearer " + trainerToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].title").value("Test Feedback"));
        }

        @Test
        void testRespondToFeedback() throws Exception {
                // Create a feedback
                Feedback feedback = new Feedback();
                feedback.setMemberId(memberUser.getId());
                feedback.setTitle("Test Feedback");
                feedback.setContent("This is a test feedback");
                feedbackRepository.save(feedback);

                Map<String, String> response = new HashMap<>();
                response.put("content", "This is a test response");

                // Trainer can respond to feedback
                mockMvc.perform(post("/api/feedback/" + feedback.getId() + "/respond")
                                .header("Authorization", "Bearer " + trainerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(response)))
                                .andExpect(status().isOk());

                // Member cannot respond to feedback
                mockMvc.perform(post("/api/feedback/" + feedback.getId() + "/respond")
                                .header("Authorization", "Bearer " + memberToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(response)))
                                .andExpect(status().isForbidden());
        }
}