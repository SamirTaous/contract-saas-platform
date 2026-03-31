package com.samir.auth.service;

import com.samir.auth.dto.LoginRequest;
import com.samir.auth.dto.RegisterRequest;

public interface AuthService {
    String register(RegisterRequest request);
    String login(LoginRequest request);
}
