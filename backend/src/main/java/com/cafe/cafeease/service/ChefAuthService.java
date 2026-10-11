package com.cafe.cafeease.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChefAuthService {
    private static final String CHEF_USER = "chef";
    private static final String CHEF_PASS = "admin123";
    private final Set<String> chefTokens = ConcurrentHashMap.newKeySet();

    public boolean isChefAuthorized(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return chefTokens.contains(token.substring(7));
        }
        return false;
    }

    public String login(String username, String password) {
        if (CHEF_USER.equals(username) && CHEF_PASS.equals(password)) {
            String token = UUID.randomUUID().toString();
            chefTokens.add(token);
            return token;
        }
        return null;
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            chefTokens.remove(authHeader.substring(7));
        }
    }
}
