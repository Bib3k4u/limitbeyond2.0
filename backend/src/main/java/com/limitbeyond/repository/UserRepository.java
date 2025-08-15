package com.limitbeyond.repository;

import com.limitbeyond.model.User;
import com.limitbeyond.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByRolesContaining(Role role);

    List<User> findByRolesContainingAndActive(Role role, boolean active);
}