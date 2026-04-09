package com.samir.ops.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserContext {
    private String username;
    private String role;
    private Long orgId;
    private String orgName;
    private String userUuid;
}