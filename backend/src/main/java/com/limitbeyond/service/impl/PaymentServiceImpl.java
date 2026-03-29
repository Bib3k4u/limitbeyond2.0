package com.limitbeyond.service.impl;

import com.limitbeyond.model.Payment;
import com.limitbeyond.repository.PaymentRepository;
import com.limitbeyond.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public Payment createPayment(Payment p) {
        if (p.getPaidAt() == null)
            p.setPaidAt(LocalDateTime.now());
        return paymentRepository.save(p);
    }

    @Override
    public List<Payment> getPaymentsForUser(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Override
    public double getRevenueBetween(LocalDateTime start, LocalDateTime end) {
        // Use DB-level date range query instead of loading all records into memory
        return paymentRepository.findByPaidAtBetween(start, end)
                .stream()
                .mapToDouble(Payment::getAmount)
                .sum();
    }
}
