package com.limitbeyond.repository;

import com.limitbeyond.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserId(String userId);

    List<Payment> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);

    List<Payment> findByUserIdOrderByPaidAtDesc(String userId);

    Page<Payment> findAllByOrderByPaidAtDesc(Pageable pageable);
}
