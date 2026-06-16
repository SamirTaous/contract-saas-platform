package com.samir.audit.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserActivityResponse {
    private UUID eventId;
    private String sourceService;
    private String httpMethod;
    private String requestPath;
    private String queryString;
    private Integer statusCode;
    private String username;
    private String userUuid;
    private Long orgId;
    private String orgUuid;
    private String role;
    private String ipAddress;
    private String userAgent;
    private Instant timestamp;
}
