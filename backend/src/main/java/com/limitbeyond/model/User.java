package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Set<Role> roles = new HashSet<>();
    private boolean active = false;
    private String assignedTrainer; // Only for MEMBER role
    private Set<String> assignedMembers = new HashSet<>(); // Only for TRAINER role

    // Fitness profile
    private Double heightCm; // user's height in centimeters
    private Double currentWeightKg; // current body weight in kg
    private String level; // BEGINNER | INTERMEDIATE | PROFESSIONAL

    // Simple weight history tracking (timestamp millis -> weight kg)
    private java.util.List<WeightEntry> weightHistory = new java.util.ArrayList<>();

    public static class WeightEntry {
        private Long timestamp;
        private Double weightKg;

        public WeightEntry() {
        }

        public WeightEntry(Long timestamp, Double weightKg) {
            this.timestamp = timestamp;
            this.weightKg = weightKg;
        }

        public Long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Long timestamp) {
            this.timestamp = timestamp;
        }

        public Double getWeightKg() {
            return weightKg;
        }

        public void setWeightKg(Double weightKg) {
            this.weightKg = weightKg;
        }
    }

    // Default constructor
    public User() {
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public boolean isActive() {
        return active;
    }

    public String getAssignedTrainer() {
        return assignedTrainer;
    }

    public Set<String> getAssignedMembers() {
        return assignedMembers;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public Double getCurrentWeightKg() {
        return currentWeightKg;
    }

    public String getLevel() {
        return level;
    }

    public java.util.List<WeightEntry> getWeightHistory() {
        return weightHistory;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setAssignedTrainer(String assignedTrainer) {
        this.assignedTrainer = assignedTrainer;
    }

    public void setAssignedMembers(Set<String> assignedMembers) {
        this.assignedMembers = assignedMembers;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public void setCurrentWeightKg(Double currentWeightKg) {
        this.currentWeightKg = currentWeightKg;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setWeightHistory(java.util.List<WeightEntry> weightHistory) {
        this.weightHistory = weightHistory;
    }
}