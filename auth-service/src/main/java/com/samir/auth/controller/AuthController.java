package com.samir.auth.controller;

import com.samir.auth.dto.AuthResponse;
import com.samir.auth.dto.LoginRequest;
import com.samir.auth.dto.RegisterRequest;
import com.samir.auth.dto.UserContext;
import com.samir.auth.service.AuthService;
import com.samir.auth.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        try {
            String result = authService.register(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // 1. Get the token from service
        String token = authService.login(request);

        // 2. Turn that token into structured data immediately
        // Note: Use a "Bearer " prefix so your getUserContext method works
        UserContext userContext = jwtUtils.getUserContext("Bearer " + token);

        // 3. Return both to the frontend
        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .expiresIn(jwtUtils.getExpiresIn())
                .user(userContext)
                .build());
    }
}