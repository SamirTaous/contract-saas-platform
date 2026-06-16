package com.samir.auth.activity;

import com.samir.auth.dto.UserContext;
import com.samir.auth.util.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ActivityLoggingFilter extends OncePerRequestFilter {

    private final ActivityEventPublisher activityEventPublisher;
    private final JwtUtils jwtUtils;

    @Value("${spring.application.name}")
    private String sourceService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            publishActivity(request, response);
        }
    }

    private boolean shouldSkip(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/");
    }

    private void publishActivity(HttpServletRequest request, HttpServletResponse response) {
        UserActivityEvent.UserActivityEventBuilder eventBuilder = UserActivityEvent.builder()
                .eventId(UUID.randomUUID())
                .sourceService(sourceService)
                .httpMethod(request.getMethod())
                .requestPath(request.getRequestURI())
                .queryString(request.getQueryString())
                .statusCode(response.getStatus())
                .ipAddress(resolveClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .timestamp(Instant.now());

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                UserContext userContext = jwtUtils.getUserContext(authHeader);
                eventBuilder
                        .username(userContext.getUsername())
                        .userUuid(userContext.getUserUuid())
                        .orgId(userContext.getOrgId())
                        .orgUuid(userContext.getOrgUuid())
                        .role(userContext.getRole());
            } catch (Exception ignored) {
                // Anonymous or invalid token — still log the request metadata.
            }
        }

        activityEventPublisher.publish(eventBuilder.build());
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
