package com.limitbeyond.controller;

import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String adminToken;
    private String memberToken;
    private User adminUser;
    private User memberUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // Create admin user
        adminUser = new User();
        adminUser.setUsername("admin");
        adminUser.setPassword(passwordEncoder.encode("password"));
        adminUser.setEmail("admin@test.com");
        adminUser.setRoles(Collections.singleton(Role.ADMIN));
        adminUser.setActive(true);
        userRepository.save(adminUser);

        // Create member user
        memberUser = new User();
        memberUser.setUsername("member");
        memberUser.setPassword(passwordEncoder.encode("password"));
        memberUser.setEmail("member@test.com");
        memberUser.setRoles(Collections.singleton(Role.MEMBER));
        memberUser.setActive(true);
        userRepository.save(memberUser);

        // Generate tokens using UserPrincipal
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);
        Authentication adminAuth = new UsernamePasswordAuthenticationToken(
                adminPrincipal,
                null,
                adminPrincipal.getAuthorities());
        adminToken = tokenProvider.generateToken(adminAuth);

        UserPrincipal memberPrincipal = UserPrincipal.create(memberUser);
        Authentication memberAuth = new UsernamePasswordAuthenticationToken(
                memberPrincipal,
                null,
                memberPrincipal.getAuthorities());
        memberToken = tokenProvider.generateToken(memberAuth);
    }

    @Test
    void testGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("member"));
    }

    @Test
    void testGetAllTrainers() throws Exception {
        mockMvc.perform(get("/api/users/trainers")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/trainers")
                .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testActivateUser() throws Exception {
        User inactiveUser = new User();
        inactiveUser.setUsername("inactive");
        inactiveUser.setPassword(passwordEncoder.encode("password"));
        inactiveUser.setEmail("inactive@test.com");
        inactiveUser.setRoles(Collections.singleton(Role.MEMBER));
        inactiveUser.setActive(false);
        userRepository.save(inactiveUser);

        mockMvc.perform(put("/api/users/" + inactiveUser.getId() + "/activate")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/users/" + inactiveUser.getId() + "/activate")
                .header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAssignTrainerToMember() throws Exception {
        User trainer = new User();
        trainer.setUsername("trainer");
        trainer.setPassword(passwordEncoder.encode("password"));
        trainer.setEmail("trainer@test.com");
        trainer.setRoles(Collections.singleton(Role.TRAINER));
        trainer.setActive(true);
        userRepository.save(trainer);

        Map<String, String> request = new HashMap<>();
        request.put("trainerId", trainer.getId());

        mockMvc.perform(put("/api/users/member/" + memberUser.getId() + "/assign-trainer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trainerId\":\"" + trainer.getId() + "\"}"))
                .andExpect(status().isOk());
    }
}