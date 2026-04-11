package com.samir.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OrganizationResponse {
    String name;
    String inviteCode;
    Long userCount;
    List<UserResponse> users;
}
