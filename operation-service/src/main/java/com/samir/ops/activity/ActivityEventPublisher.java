package com.samir.ops.activity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(UserActivityEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.ACTIVITY_EXCHANGE,
                    RabbitMQConstants.ACTIVITY_ROUTING_KEY,
                    event
            );
        } catch (Exception e) {
            log.warn("Failed to publish user activity event for {} {}: {}",
                    event.getHttpMethod(), event.getRequestPath(), e.getMessage());
        }
    }
}
