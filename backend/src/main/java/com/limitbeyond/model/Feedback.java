package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "feedback")
public class Feedback {
    @Id
    private String id;
    private String memberId;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private List<FeedbackResponse> responses = new ArrayList<>();

    // Default constructor
    public Feedback() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getMemberId() {
        return memberId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<FeedbackResponse> getResponses() {
        return responses;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setResponses(List<FeedbackResponse> responses) {
        this.responses = responses;
    }

    // Static inner class for feedback responses
    public static class FeedbackResponse {
        private String responderId;
        private String content;
        private LocalDateTime responseTime;

        public FeedbackResponse() {
            this.responseTime = LocalDateTime.now();
        }

        // Getters
        public String getResponderId() {
            return responderId;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getResponseTime() {
            return responseTime;
        }

        // Setters
        public void setResponderId(String responderId) {
            this.responderId = responderId;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public void setResponseTime(LocalDateTime responseTime) {
            this.responseTime = responseTime;
        }
    }
}