package com.samir.auth.service;

import com.samir.auth.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

public interface UserService {
    public List<UserResponse> getAllUsers();
    public UserResponse getUserByUUID(UUID uuid);
    public void deleteByUUID(UUID uuid);
}
