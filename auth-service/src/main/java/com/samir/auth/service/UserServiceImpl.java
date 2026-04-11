package com.samir.auth.service;

import com.samir.auth.dto.UserContext;
import com.samir.auth.dto.UserResponse;
import com.samir.auth.exception.UserNotFoundException;
import com.samir.auth.model.User;
import com.samir.auth.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers(UserContext userContext) {
        if(userContext.getRole().equals("SUPER_ADMIN"))
            return userRepository.findAll().stream()
                    .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                    .toList();
        return userRepository.findUsersByOrganization_Id(userContext.getOrgId()).stream()
                .map(user -> new UserResponse(user.getUuid(), user.getUsername(), user.getEmail(), user.getOrganization().getName(), user.getRole()))
                .toList();
    }

    public UserResponse getUserByUUID(UserContext userContext, UUID uuid){
        User user = findAndVerifyUserAccess(userContext, uuid);
        return mapToResponse(user);
    }

    @Transactional
    public void deleteByUUID(UserContext userContext, UUID uuid){
        findAndVerifyUserAccess(userContext, uuid);
        userRepository.deleteByUuid(uuid);
    }

    // Helper functions

    private User findAndVerifyUserAccess(UserContext userContext, UUID uuid){
        User user = userRepository.findUserByUuid(uuid)
                .orElseThrow(()-> new UserNotFoundException(uuid));
        if(userContext.getRole().equals("ADMIN"))
            if(!userContext.getOrgName().equals(user.getOrganization().getName()))
                throw new UserNotFoundException(uuid);
        return user;
    }

    private UserResponse mapToResponse(User user){
        return new UserResponse(
                user.getUuid(),
                user.getUsername(),
                user.getEmail(),
                user.getOrganization().getName(),
                user.getRole()
        );
    }

}
