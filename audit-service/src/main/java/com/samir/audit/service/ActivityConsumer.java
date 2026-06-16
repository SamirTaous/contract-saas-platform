package com.samir.audit.service;

import com.samir.audit.activity.RabbitMQConstants;
import com.samir.audit.activity.UserActivityEvent;
import com.samir.audit.model.UserActivity;
import com.samir.audit.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityConsumer {

    private final UserActivityRepository userActivityRepository;

    @RabbitListener(queues = RabbitMQConstants.ACTIVITY_QUEUE)
    @Transactional
    public void consume(UserActivityEvent event) {
        if (event == null) {
            log.warn("Received null user activity event");
            return;
        }

        if (event.getEventId() == null) {
            log.warn("Skipping user activity event without eventId");
            return;
        }

        if (userActivityRepository.existsByEventId(event.getEventId())) {
            log.debug("Duplicate user activity event {}, skipping", event.getEventId());
            return;
        }

        UserActivity activity = UserActivity.builder()
                .eventId(event.getEventId())
                .sourceService(event.getSourceService())
                .httpMethod(event.getHttpMethod())
                .requestPath(event.getRequestPath())
                .queryString(event.getQueryString())
                .statusCode(event.getStatusCode())
                .username(event.getUsername())
                .userUuid(event.getUserUuid())
                .orgId(event.getOrgId())
                .orgUuid(event.getOrgUuid())
                .role(event.getRole())
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .timestamp(event.getTimestamp())
                .build();

        userActivityRepository.save(activity);
        log.info("Stored user activity {} {} from {} (user={})",
                event.getHttpMethod(), event.getRequestPath(), event.getSourceService(), event.getUsername());
    }
}
