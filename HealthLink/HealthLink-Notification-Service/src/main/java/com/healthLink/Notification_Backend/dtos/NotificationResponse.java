package com.healthLink.Notification_Backend.dtos;

import com.healthLink.Notification_Backend.Enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private Long id;

    private String title;

    private String message;

    private NotificationType type;

    private Boolean isRead;

    private LocalDateTime createdAt;
}