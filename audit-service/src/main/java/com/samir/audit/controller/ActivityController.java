package com.samir.audit.controller;

import com.samir.audit.dto.UserActivityResponse;
import com.samir.audit.dto.UserContext;
import com.samir.audit.service.ActivityQueryService;
import com.samir.audit.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityQueryService activityQueryService;
    private final JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<Page<UserActivityResponse>> getActivities(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UserContext userContext = jwtUtils.getUserContext(authHeader);
        Page<UserActivityResponse> activities = activityQueryService.getActivities(
                userContext,
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(activities);
    }
}
