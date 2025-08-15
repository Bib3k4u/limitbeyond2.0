package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "diet_chats")
public class DietChat {
    @Id
    private String id;
    private String memberId;
    private String title;
    private String initialQuery;
    private LocalDateTime createdAt;
    private List<DietChatMessage> messages = new ArrayList<>();

    // Default constructor
    public DietChat() {
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

    public String getInitialQuery() {
        return initialQuery;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<DietChatMessage> getMessages() {
        return messages;
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

    public void setInitialQuery(String initialQuery) {
        this.initialQuery = initialQuery;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setMessages(List<DietChatMessage> messages) {
        this.messages = messages;
    }

    // Static inner class for chat messages
    public static class DietChatMessage {
        private String senderId;
        private String content;
        private LocalDateTime timestamp;
        private Role senderRole;
        private boolean edited;

        public DietChatMessage() {
            this.timestamp = LocalDateTime.now();
            this.edited = false;
        }

        // Getters
        public String getSenderId() {
            return senderId;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public Role getSenderRole() {
            return senderRole;
        }

        public boolean isEdited() {
            return edited;
        }

        // Setters
        public void setSenderId(String senderId) {
            this.senderId = senderId;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public void setSenderRole(Role senderRole) {
            this.senderRole = senderRole;
        }

        public void setEdited(boolean edited) {
            this.edited = edited;
        }
    }
}