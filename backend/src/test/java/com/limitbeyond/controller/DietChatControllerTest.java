package com.limitbeyond.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.limitbeyond.model.DietChat;
import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.DietChatRepository;
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
public class DietChatControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private DietChatRepository dietChatRepository;

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
                dietChatRepository.deleteAll();

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
        void testCreateDietChat() throws Exception {
                Map<String, String> request = new HashMap<>();
                request.put("title", "Diet Plan Discussion");
                request.put("initialQuery", "Need help with protein intake");

                mockMvc.perform(post("/api/diet-chat")
                                .header("Authorization", "Bearer " + memberToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk());

                // Trainer should not be able to create diet chat
                mockMvc.perform(post("/api/diet-chat")
                                .header("Authorization", "Bearer " + trainerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        void testGetDietChats() throws Exception {
                // Create a diet chat
                DietChat dietChat = new DietChat();
                dietChat.setMemberId(memberUser.getId());
                dietChat.setTitle("Diet Plan Discussion");
                dietChat.setInitialQuery("Need help with protein intake");
                dietChatRepository.save(dietChat);

                // Member can view their diet chats
                mockMvc.perform(get("/api/diet-chat")
                                .header("Authorization", "Bearer " + memberToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].title").value("Diet Plan Discussion"));

                // Trainer can view all diet chats
                mockMvc.perform(get("/api/diet-chat")
                                .header("Authorization", "Bearer " + trainerToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].title").value("Diet Plan Discussion"));
        }

        @Test
        void testReplyToDietChat() throws Exception {
                // Create a diet chat
                DietChat dietChat = new DietChat();
                dietChat.setMemberId(memberUser.getId());
                dietChat.setTitle("Diet Plan Discussion");
                dietChat.setInitialQuery("Need help with protein intake");
                dietChatRepository.save(dietChat);

                Map<String, String> response = new HashMap<>();
                response.put("content", "Let's calculate your protein needs");

                // Trainer can reply to diet chat
                mockMvc.perform(post("/api/diet-chat/" + dietChat.getId() + "/reply")
                                .header("Authorization", "Bearer " + trainerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(response)))
                                .andExpect(status().isOk());

                // Member cannot reply to their own diet chat
                mockMvc.perform(post("/api/diet-chat/" + dietChat.getId() + "/reply")
                                .header("Authorization", "Bearer " + memberToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(response)))
                                .andExpect(status().isForbidden());
        }
}