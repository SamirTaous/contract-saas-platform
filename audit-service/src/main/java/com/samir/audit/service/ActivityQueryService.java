package com.samir.audit.service;

import com.samir.audit.dto.UserActivityResponse;
import com.samir.audit.dto.UserContext;
import com.samir.audit.model.UserActivity;
import com.samir.audit.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityQueryService {

    private final UserActivityRepository userActivityRepository;

    public Page<UserActivityResponse> getActivities(UserContext userContext, Pageable pageable) {
        Page<UserActivity> activities = "SUPER_ADMIN".equals(userContext.getRole())
                ? userActivityRepository.findAllByOrderByTimestampDesc(pageable)
                : userActivityRepository.findByOrgIdOrderByTimestampDesc(userContext.getOrgId(), pageable);

        return activities.map(this::toResponse);
    }

    private UserActivityResponse toResponse(UserActivity activity) {
        return UserActivityResponse.builder()
                .eventId(activity.getEventId())
                .sourceService(activity.getSourceService())
                .httpMethod(activity.getHttpMethod())
                .requestPath(activity.getRequestPath())
                .queryString(activity.getQueryString())
                .statusCode(activity.getStatusCode())
                .username(activity.getUsername())
                .userUuid(activity.getUserUuid())
                .orgId(activity.getOrgId())
                .orgUuid(activity.getOrgUuid())
                .role(activity.getRole())
                .ipAddress(activity.getIpAddress())
                .userAgent(activity.getUserAgent())
                .timestamp(activity.getTimestamp())
                .build();
    }
}
