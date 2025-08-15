package com.limitbeyond.repository;

import com.limitbeyond.model.DietChat;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DietChatRepository extends MongoRepository<DietChat, String> {
    List<DietChat> findByMemberId(String memberId);

    List<DietChat> findByMemberIdOrderByCreatedAtDesc(String memberId);
}