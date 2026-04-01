package com.samir.auth.service;

import com.samir.auth.dto.UserResponse;
import com.samir.auth.model.User;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl {
    private final UserRepository userRepository;
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                .toList();
    }
}
