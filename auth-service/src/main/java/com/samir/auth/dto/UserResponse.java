package com.samir.auth.dto;

import com.samir.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UserResponse {
    UUID uuid;
    String username;
    String email;
    String org;
    Role role;
}
