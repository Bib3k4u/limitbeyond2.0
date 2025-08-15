package com.limitbeyond.repository;

import com.limitbeyond.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByMemberId(String memberId);

    List<Feedback> findByMemberIdOrderByCreatedAtDesc(String memberId);
}