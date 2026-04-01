package com.samir.auth.controller;

import com.samir.auth.dto.LoginRequest;
import com.samir.auth.dto.RegisterRequest;
import com.samir.auth.service.AuthService;
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

    @PostMapping("/register")
    ResponseEntity<String> register(@RequestBody RegisterRequest request){
        try{
            String result = authService.register(request);
            return ResponseEntity.ok(result);
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    ResponseEntity<String> login(@RequestBody LoginRequest request){
        try{
            String result = authService.login(request);
            return ResponseEntity.ok(result);
        }
        catch(RuntimeException e){
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}
