package com.limitbeyond.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "payments")
public class Payment {
    @Id
    private String id;
    private String userId;
    private int months; // duration in months
    private double amount;
    private LocalDateTime paidAt;

    public Payment() {
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public int getMonths() {
        return months;
    }

    public double getAmount() {
        return amount;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setMonths(int months) {
        this.months = months;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
