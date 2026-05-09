package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.clients.NotificationClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationClientService {

    private final NotificationClient notificationClient;

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallbackSendNotification")
    public void sendNotification(
            Long userId,
            String role,
            String title,
            String message,
            NotificationType notificationType
    ) {
        Map<String, Object> body = Map.of(
                "targetUserId", userId,
                "targetRole", role,
                "type", notificationType.name(),
                "title", title,
                "message", message
        );

        notificationClient.sendNotification(body);
        log.info("Notification sent successfully to user {}", userId);
    }

    public void fallbackSendNotification(Long userId, String role, String title, String message, NotificationType notificationType, Throwable t) {
        log.error("Failed to send notification to user {}. Reason: {}. Triggering fallback.", userId, t.getMessage());
    }
}