package com.healthLink.Notification_Backend.dtos;

import com.healthLink.Notification_Backend.Enums.NotificationType;
import com.healthLink.Notification_Backend.Enums.TargetRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {

    @NotNull
    private Long targetUserId;

    @NotNull
    private TargetRole targetRole;

    @NotNull
    private NotificationType type;

    @NotBlank
    private String title;

    @NotBlank
    private String message;
}