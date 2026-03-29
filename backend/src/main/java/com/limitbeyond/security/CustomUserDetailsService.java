package com.limitbeyond.security;

import com.google.common.cache.Cache;
import com.limitbeyond.model.User;
import com.limitbeyond.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Qualifier("userCache")
    private Cache<String, Object> userCache;

    /**
     * Resolve a user by username, email address, or phone number.
     * Spring Security passes whatever string was submitted in the login form here.
     */
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Try cache first (keyed by the raw identifier that was submitted)
        String cacheKey = "userDetails:" + identifier;
        UserDetails cached = (UserDetails) userCache.getIfPresent(cacheKey);
        if (cached != null) {
            return cached;
        }

        // Resolve: username → email → phone number
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .or(() -> userRepository.findByPhoneNumber(identifier))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No user found with username / email / phone: " + identifier));

        UserDetails userDetails = UserPrincipal.create(user);

        // Cache under the submitted identifier AND the canonical username so both hit
        userCache.put(cacheKey, userDetails);
        userCache.put("userDetails:" + user.getUsername(), userDetails);
        return userDetails;
    }

    public UserDetails loadUserById(String id) {
        String cacheKey = "userDetailsById:" + id;
        UserDetails cached = (UserDetails) userCache.getIfPresent(cacheKey);
        if (cached != null) {
            return cached;
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        UserDetails userDetails = UserPrincipal.create(user);
        userCache.put(cacheKey, userDetails);
        return userDetails;
    }
}
