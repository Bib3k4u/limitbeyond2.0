package com.limitbeyond.controller;

import com.limitbeyond.model.Feedback;
import com.limitbeyond.model.Role;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.FeedbackRepository;
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
@RequestMapping("/api/feedback")
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
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<?> createFeedback(@RequestBody FeedbackRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = new Feedback();
            feedback.setMemberId(currentUser.getId());
            feedback.setTitle(request.getTitle());
            feedback.setContent(request.getContent());

            feedbackRepository.save(feedback);
            return ResponseEntity.ok("Feedback submitted successfully");
        } catch (Exception e) {
            logger.error("Error creating feedback: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to create feedback: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'MEMBER')")
    public ResponseEntity<?> getFeedback() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Feedback> feedbackList;
            if (currentUser.getRoles().contains(Role.MEMBER)) {
                feedbackList = feedbackRepository.findByMemberIdOrderByCreatedAtDesc(currentUser.getId());
            } else if (currentUser.getRoles().contains(Role.TRAINER)) {
                feedbackList = feedbackRepository.findAll(); // Trainers can see all feedback
            } else {
                feedbackList = feedbackRepository.findAll(); // Admins can see all feedback
            }

            return ResponseEntity.ok(feedbackList);
        } catch (Exception e) {
            logger.error("Error fetching feedback: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to fetch feedback: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/{feedbackId}/respond")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> respondToFeedback(
            @PathVariable String feedbackId,
            @RequestBody ResponseRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));

            Feedback.FeedbackResponse response = new Feedback.FeedbackResponse();
            response.setResponderId(currentUser.getId());
            response.setContent(request.getContent());

            feedback.getResponses().add(response);
            feedbackRepository.save(feedback);

            return ResponseEntity.ok("Response added successfully");
        } catch (Exception e) {
            logger.error("Error responding to feedback: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to respond to feedback: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{feedbackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> updateFeedback(
            @PathVariable String feedbackId,
            @RequestBody FeedbackRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));

            // Verify ownership or admin rights
            if (!feedback.getMemberId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to update this feedback");
            }

            feedback.setTitle(request.getTitle());
            feedback.setContent(request.getContent());
            feedbackRepository.save(feedback);

            return ResponseEntity.ok("Feedback updated successfully");
        } catch (Exception e) {
            logger.error("Error updating feedback: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update feedback: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{feedbackId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEMBER')")
    public ResponseEntity<?> deleteFeedback(@PathVariable String feedbackId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));

            // Verify ownership or admin rights
            if (!feedback.getMemberId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to delete this feedback");
            }

            feedbackRepository.delete(feedback);
            return ResponseEntity.ok("Feedback deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting feedback: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to delete feedback: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{feedbackId}/responses/{responseIndex}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> updateFeedbackResponse(
            @PathVariable String feedbackId,
            @PathVariable int responseIndex,
            @RequestBody ResponseRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));

            if (responseIndex < 0 || responseIndex >= feedback.getResponses().size()) {
                return ResponseEntity.badRequest().body("Invalid response index");
            }

            Feedback.FeedbackResponse response = feedback.getResponses().get(responseIndex);

            // Verify ownership or admin rights
            if (!response.getResponderId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to update this response");
            }

            response.setContent(request.getContent());
            feedbackRepository.save(feedback);

            return ResponseEntity.ok("Response updated successfully");
        } catch (Exception e) {
            logger.error("Error updating feedback response: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to update response: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{feedbackId}/responses/{responseIndex}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<?> deleteFeedbackResponse(
            @PathVariable String feedbackId,
            @PathVariable int responseIndex) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Feedback feedback = feedbackRepository.findById(feedbackId)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));

            if (responseIndex < 0 || responseIndex >= feedback.getResponses().size()) {
                return ResponseEntity.badRequest().body("Invalid response index");
            }

            Feedback.FeedbackResponse response = feedback.getResponses().get(responseIndex);

            // Verify ownership or admin rights
            if (!response.getResponderId().equals(currentUser.getId()) &&
                    !currentUser.getRoles().contains(Role.ADMIN)) {
                return ResponseEntity.status(403).body("Not authorized to delete this response");
            }

            feedback.getResponses().remove(responseIndex);
            feedbackRepository.save(feedback);

            return ResponseEntity.ok("Response deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting feedback response: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to delete response: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Request classes
    public static class FeedbackRequest {
        private String title;
        private String content;

        // Getters
        public String getTitle() {
            return title;
        }

        public String getContent() {
            return content;
        }

        // Setters
        public void setTitle(String title) {
            this.title = title;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class ResponseRequest {
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