package com.limitbeyond.service;

import com.limitbeyond.model.Payment;
import java.util.List;

public interface PaymentService {
    Payment createPayment(Payment p);

    List<Payment> getPaymentsForUser(String userId);

    double getRevenueBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
