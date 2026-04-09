package com.samir.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class UserContext {
    private String username;
    private String role;
    private Long orgId;
    private String orgName;
    private String userUuid;
}