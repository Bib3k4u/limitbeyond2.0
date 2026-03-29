package com.limitbeyond.service.impl;

import com.google.common.cache.Cache;
import com.limitbeyond.service.UserService;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Qualifier("userCache")
    private Cache<String, Object> userCache;

    @Override
    public Optional<User> findByUsername(String username) {
        String cacheKey = "user:username:" + username;
        User cached = (User) userCache.getIfPresent(cacheKey);
        if (cached != null) {
            return Optional.of(cached);
        }
        Optional<User> user = userRepository.findByUsername(username);
        user.ifPresent(u -> userCache.put(cacheKey, u));
        return user;
    }

    @Override
    public Optional<User> findById(String id) {
        String cacheKey = "user:id:" + id;
        User cached = (User) userCache.getIfPresent(cacheKey);
        if (cached != null) {
            return Optional.of(cached);
        }
        Optional<User> user = userRepository.findById(id);
        user.ifPresent(u -> userCache.put(cacheKey, u));
        return user;
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User save(User user) {
        // Invalidate cached entries on save
        userCache.invalidate("user:username:" + user.getUsername());
        userCache.invalidate("user:id:" + user.getId());
        userCache.invalidate("userDetails:" + user.getUsername());
        userCache.invalidate("userDetailsById:" + user.getId());
        return userRepository.save(user);
    }

    @Override
    public void delete(String id) {
        userRepository.findById(id).ifPresent(u -> {
            userCache.invalidate("user:username:" + u.getUsername());
            userCache.invalidate("userDetails:" + u.getUsername());
            userCache.invalidate("userDetailsById:" + id);
        });
        userCache.invalidate("user:id:" + id);
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
