package com.samir.auth.dto;

import lombok.Data;

import java.util.Optional;

@Data
public class RegisterRequest {
    private String inviteCode;
    private String orgName;
    private String username;
    private String email;
    private String password;
}
