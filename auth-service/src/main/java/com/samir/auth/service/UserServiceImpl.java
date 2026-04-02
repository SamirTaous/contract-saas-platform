package com.samir.auth.service;

import com.samir.auth.dto.UserResponse;
import com.samir.auth.exception.UserNotFoundException;
import com.samir.auth.model.User;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                .toList();
    }

    public UserResponse getUserByUUID(UUID uuid){
        return userRepository.findUserByUuid(uuid)
                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                .orElseThrow(() ->
                        new UserNotFoundException(uuid)
                );
    }

    @Transactional
    public void deleteByUUID(UUID uuid){
        if(!userRepository.existsUserByUuid((uuid))){
            throw new UserNotFoundException(uuid);
        }
        userRepository.deleteByUuid(uuid);
    }

}
