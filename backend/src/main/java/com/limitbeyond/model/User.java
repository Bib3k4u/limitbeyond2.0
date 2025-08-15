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
}