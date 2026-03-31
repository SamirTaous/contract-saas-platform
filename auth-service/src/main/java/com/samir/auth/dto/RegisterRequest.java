package com.samir.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private Long organizationId;
    private String username;
    private String email;
    private String password;
}
