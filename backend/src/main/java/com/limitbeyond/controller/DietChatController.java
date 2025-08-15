package com.limitbeyond.controller;

import com.limitbeyond.model.DietChat;
import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.DietChatRepository;
import com.limitbeyond.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diet-chat")
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
public class DietChatController {

    private static final Logger logger = LoggerFactory.getLogger(DietChatController.class);

    @Autowired
    private DietChatRepository dietChatRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<?> createDietChat(@RequestBody DietChatRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = new DietChat();
            dietChat.setMemberId(currentUser.getId());
            dietChat.setTitle(request.getTitle());
            dietChat.setInitialQuery(request.getInitialQuery());

            DietChat.DietChatMessage initialMessage = new DietChat.DietChatMessage();
            initialMessage.setSenderId(currentUser.getId());
            initialMessage.setContent(request.getInitialQuery());
            initialMessage.setSenderRole(Role.MEMBER);

            dietChat.getMessages().add(initialMessage);
            dietChatRepository.save(dietChat);

            return ResponseEntity.ok("Diet chat created successfully");
        } catch (Exception e) {
            logger.error("Error creating diet chat: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create diet chat: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> getDietChats() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<DietChat> dietChats;
            if (currentUser.getRoles().contains(Role.MEMBER)) {
                dietChats = dietChatRepository.findByMemberIdOrderByCreatedAtDesc(currentUser.getId());
            } else if (currentUser.getRoles().contains(Role.TRAINER)) {
                dietChats = dietChatRepository.findAll(); // Trainers can see all diet chats
            } else {
                dietChats = dietChatRepository.findAll(); // Admins can see all diet chats
            }

            return ResponseEntity.ok(dietChats);
        } catch (Exception e) {
            logger.error("Error fetching diet chats: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to fetch diet chats: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/{chatId}/reply")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> replyToDietChat(
            @PathVariable String chatId,
            @RequestBody ReplyRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = dietChatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Diet chat not found"));

            DietChat.DietChatMessage reply = new DietChat.DietChatMessage();
            reply.setSenderId(currentUser.getId());
            reply.setContent(request.getContent());
            reply.setSenderRole(currentUser.getRoles().iterator().next()); // Assuming single role

            dietChat.getMessages().add(reply);
            dietChatRepository.save(dietChat);

            return ResponseEntity.ok("Reply added successfully");
        } catch (Exception e) {
            logger.error("Error replying to diet chat: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to reply to diet chat: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{chatId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateDietChat(
            @PathVariable String chatId,
            @RequestBody DietChatRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = dietChatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Diet chat not found"));

            // Verify ownership or admin rights
            if (!dietChat.getMemberId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to update this chat");
            }

            dietChat.setTitle(request.getTitle());
            dietChatRepository.save(dietChat);

            return ResponseEntity.ok("Diet chat updated successfully");
        } catch (Exception e) {
            logger.error("Error updating diet chat: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update diet chat: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{chatId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> deleteDietChat(@PathVariable String chatId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = dietChatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Diet chat not found"));

            // Verify ownership or admin rights
            if (!dietChat.getMemberId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to delete this chat");
            }

            dietChatRepository.delete(dietChat);
            return ResponseEntity.ok("Diet chat deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting diet chat: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to delete diet chat: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{chatId}/messages/{messageIndex}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> updateMessage(
            @PathVariable String chatId,
            @PathVariable int messageIndex,
            @RequestBody ReplyRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = dietChatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Diet chat not found"));

            if (messageIndex < 0 || messageIndex >= dietChat.getMessages().size()) {
                return ResponseEntity.badRequest().body("Invalid message index");
            }

            DietChat.DietChatMessage message = dietChat.getMessages().get(messageIndex);

            // Verify message ownership or admin rights
            if (!message.getSenderId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to update this message");
            }

            message.setContent(request.getContent());
            message.setEdited(true);
            dietChatRepository.save(dietChat);

            return ResponseEntity.ok("Message updated successfully");
        } catch (Exception e) {
            logger.error("Error updating message: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update message: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{chatId}/messages/{messageIndex}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> deleteMessage(
            @PathVariable String chatId,
            @PathVariable int messageIndex) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            DietChat dietChat = dietChatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Diet chat not found"));

            if (messageIndex < 0 || messageIndex >= dietChat.getMessages().size()) {
                return ResponseEntity.badRequest().body("Invalid message index");
            }

            DietChat.DietChatMessage message = dietChat.getMessages().get(messageIndex);

            // Verify message ownership or admin rights
            if (!message.getSenderId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to delete this message");
            }

            dietChat.getMessages().remove(messageIndex);
            dietChatRepository.save(dietChat);

            return ResponseEntity.ok("Message deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting message: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to delete message: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Request classes
    public static class DietChatRequest {
        private String title;
        private String initialQuery;

        // Getters
        public String getTitle() {
            return title;
        }

        public String getInitialQuery() {
            return initialQuery;
        }

        // Setters
        public void setTitle(String title) {
            this.title = title;
        }

        public void setInitialQuery(String initialQuery) {
            this.initialQuery = initialQuery;
        }
    }

    public static class ReplyRequest {
        private String content;

        // Getter
        public String getContent() {
            return content;
        }

        // Setter
        public void setContent(String content) {
            this.content = content;
        }
    }
}