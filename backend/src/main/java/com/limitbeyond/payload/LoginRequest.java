package com.limitbeyond.payload;

import jakarta.validation.constraints.NotBlank;

/**
 * Login request payload.
 * The {@code identifier} field accepts a username, email address, or phone number.
 */
public class LoginRequest {

    @NotBlank
    private String identifier;

    @NotBlank
    private String password;

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
