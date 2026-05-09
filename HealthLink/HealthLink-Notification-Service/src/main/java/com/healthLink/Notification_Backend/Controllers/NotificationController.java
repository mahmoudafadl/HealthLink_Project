package com.healthLink.Notification_Backend.Controllers;

import com.healthLink.Notification_Backend.Entities.Notification;
import com.healthLink.Notification_Backend.dtos.NotificationRequest;
import com.healthLink.Notification_Backend.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public Notification createNotification(
            @Valid @RequestBody NotificationRequest request
    ) {

        return notificationService.createNotification(request);
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(
            @PathVariable Long userId
    ) {

        return notificationService.getUserNotifications(userId);
    }

    @PutMapping("/{notificationId}/read")
    public Notification markAsRead(
            @PathVariable Long notificationId
    ) {

        return notificationService.markAsRead(notificationId);
    }
}