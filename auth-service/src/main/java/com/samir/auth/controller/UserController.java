package com.samir.auth.controller;


import com.samir.auth.dto.UserResponse;
import com.samir.auth.model.User;
import com.samir.auth.service.UserServiceImpl;
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

    private final UserServiceImpl userServiceImpl;

    @GetMapping("/all")
    ResponseEntity<List<UserResponse>> getAllUsers(){
        List<UserResponse> users = userServiceImpl.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{uuid}")
    ResponseEntity<UserResponse> getUserByUUID(@PathVariable UUID uuid){
        UserResponse user = userServiceImpl.getUserByUUID(uuid);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{uuid}")
    ResponseEntity<Void> removeUserByUUID(@PathVariable UUID uuid){
        userServiceImpl.delUserByUUID(uuid);
        return ResponseEntity.noContent().build();
    }



}
