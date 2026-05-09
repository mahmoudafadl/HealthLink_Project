package com.healthLink.Notification_Backend.Entities;

import com.healthLink.Notification_Backend.Enums.NotificationType;
import com.healthLink.Notification_Backend.Enums.TargetRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long targetUserId;

    @Enumerated(EnumType.STRING)
    private TargetRole targetRole;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;

    private String message;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime createdAt;
}