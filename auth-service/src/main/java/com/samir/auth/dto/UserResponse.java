package com.samir.auth.dto;

import com.samir.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    String username;
    String email;
    String org;
    Role role;
}
