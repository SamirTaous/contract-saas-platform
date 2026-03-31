package com.samir.auth.service;

import com.samir.auth.dto.LoginRequest;
import com.samir.auth.dto.RegisterRequest;
import com.samir.auth.repository.OrganizationRepository;
import com.samir.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService{

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    public String register(RegisterRequest request) {

        // validate data
        if(userRepository.existsByEmail(request.getEmail()))
            return "This email already exists !";
        if(userRepository.existsUserByUsername(request.getUsername()))
            return "This username already exists !";

        return "";
    }

    @Override
    public String login(LoginRequest request) {
        return "";
    }
}
