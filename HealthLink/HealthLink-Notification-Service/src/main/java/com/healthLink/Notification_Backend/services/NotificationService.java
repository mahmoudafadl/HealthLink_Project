package com.healthLink.Notification_Backend.services;

import com.healthLink.Notification_Backend.Entities.Notification;
import com.healthLink.Notification_Backend.Repositories.NotificationRepository;
import com.healthLink.Notification_Backend.dtos.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
            NotificationRequest request
    ) {

        Notification notification = Notification.builder()
                .targetUserId(request.getTargetUserId())
                .targetRole(request.getTargetRole())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(
            Long userId
    ) {
        return notificationRepository
                .findByTargetUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(
            Long notificationId
    ) {

        if (notificationId == null) throw new IllegalArgumentException("Notification ID cannot be null");
        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException("Notification not found")
                        );

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }
}