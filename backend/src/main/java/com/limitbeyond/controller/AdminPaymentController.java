package com.limitbeyond.controller;

import com.limitbeyond.model.Payment;
import com.limitbeyond.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment p) {
        Payment saved = paymentService.createPayment(p);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsForUser(@PathVariable String userId) {
        return ResponseEntity.ok(paymentService.getPaymentsForUser(userId));
    }

    @GetMapping("/revenue")
    public ResponseEntity<Double> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDateTime s = LocalDateTime.of(start, LocalTime.MIN);
        LocalDateTime e = LocalDateTime.of(end, LocalTime.MAX);
        return ResponseEntity.ok(paymentService.getRevenueBetween(s, e));
    }
}
