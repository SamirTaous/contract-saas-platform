package com.samir.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class OrganizationResponse {
    UUID uuid;
    String name;
    String inviteCode;
    Long userCount;
    List<UserResponse> users;
}
