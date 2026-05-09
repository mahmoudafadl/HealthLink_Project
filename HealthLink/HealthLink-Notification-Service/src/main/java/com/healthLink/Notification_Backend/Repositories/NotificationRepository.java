package com.healthLink.Notification_Backend.Repositories;

import com.healthLink.Notification_Backend.Entities.Notification;
import com.healthLink.Notification_Backend.Enums.TargetRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(
            Long targetUserId
    );

    List<Notification> findByTargetRoleOrderByCreatedAtDesc(
            TargetRole targetRole
    );
}