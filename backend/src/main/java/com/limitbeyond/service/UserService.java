package com.limitbeyond.service;

import com.limitbeyond.model.User;
import java.util.Optional;
import java.util.List;

public interface UserService {
    Optional<User> findByUsername(String username);

    Optional<User> findById(String id);

    List<User> findAll();

    User save(User user);

    void delete(String id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}