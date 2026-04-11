package com.samir.auth.service;

import com.samir.auth.dto.UserContext;
import com.samir.auth.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

public interface UserService {
    public List<UserResponse> getAllUsers(UserContext user);
    public UserResponse getUserByUUID(UserContext user, UUID uuid);
    public void deleteByUUID(UserContext user, UUID uuid);
}
