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
        double sum = 0.0;
        for (Payment p : paymentRepository.findAll()) {
            if (p.getPaidAt() == null)
                continue;
            if ((p.getPaidAt().isEqual(start) || p.getPaidAt().isAfter(start))
                    && (p.getPaidAt().isEqual(end) || p.getPaidAt().isBefore(end))) {
                sum += p.getAmount();
            }
        }
        return sum;
    }
}
