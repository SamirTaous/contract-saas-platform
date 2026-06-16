package com.samir.audit.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityEvent {

    private UUID eventId;
    private String sourceService;
    private String httpMethod;
    private String requestPath;
    private String queryString;
    private int statusCode;
    private String username;
    private String userUuid;
    private Long orgId;
    private String orgUuid;
    private String role;
    private String ipAddress;
    private String userAgent;
    private Instant timestamp;
}
