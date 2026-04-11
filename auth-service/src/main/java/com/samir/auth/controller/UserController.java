package com.samir.auth.controller;


import com.samir.auth.dto.UserContext;
import com.samir.auth.dto.UserResponse;
import com.samir.auth.model.User;
import com.samir.auth.service.UserService;
import com.samir.auth.service.UserServiceImpl;
import com.samir.auth.util.JwtUtils;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    @GetMapping("/all")
    ResponseEntity<List<UserResponse>> getAllUsers(@RequestHeader("Authorization") String authHeader){
        UserContext user = jwtUtils.getUserContext(authHeader);
        List<UserResponse> users = userService.getAllUsers(user);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{uuid}")
    ResponseEntity<UserResponse> getUserByUUID(@RequestHeader("Authorization") String authHeader, @PathVariable UUID uuid){
        UserContext userContext = jwtUtils.getUserContext(authHeader);
        UserResponse user = userService.getUserByUUID(userContext, uuid);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{uuid}")
    ResponseEntity<Void> removeUserByUUID(@RequestHeader("Authorization") String authHeader, @PathVariable UUID uuid){
        UserContext userContext = jwtUtils.getUserContext(authHeader);
        userService.deleteByUUID(userContext, uuid);
        return ResponseEntity.noContent().build();
    }



}
