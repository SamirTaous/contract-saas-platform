package com.samir.ops.activity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 1. ADDED: Define the Queue bean
    @Bean
    public Queue userActivityQueue() {
        return new Queue(RabbitMQConstants.ACTIVITY_QUEUE, true, false, false);
    }

    // 2. KEEP: Your existing Exchange bean
    @Bean
    public TopicExchange userActivityExchange() {
        return new TopicExchange(RabbitMQConstants.ACTIVITY_EXCHANGE, true, false);
    }

    // 3. ADDED: Define the Binding (Links Queue to Exchange via Routing Key)
    @Bean
    public Binding userActivityBinding(Queue userActivityQueue, TopicExchange userActivityExchange) {
        return BindingBuilder.bind(userActivityQueue)
                .to(userActivityExchange)
                .with(RabbitMQConstants.ACTIVITY_ROUTING_KEY);
    }

    // 4. FIXED: Modern, non-deprecated JSON Converter that supports LocalDateTime
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Enables Java 8 date/time serialization
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}