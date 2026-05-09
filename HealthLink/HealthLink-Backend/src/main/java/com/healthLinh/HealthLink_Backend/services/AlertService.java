package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.Alert;
import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Repositories.AlertRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import com.healthLinh.HealthLink_Backend.dtos.AlertRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class AlertService {

    private final UserRepo userRepository;
    private final NotificationClientService notificationClientService;
    private final AlertRepository alertRepository;

    /*
     * Admin sends alert to:
     *
     * ALL_DOCTORS
     * ALL_NURSES
     * USER
     */
    public void sendAdminAlert(AlertRequest request) {

        List<User> recipients = new ArrayList<>();

        switch (request.getTargetType()) {

            case "ALL_DOCTORS":
                recipients = userRepository.findByRole(
                        Role.DOCTOR
                );
                break;

            case "ALL_NURSES":
                recipients = userRepository.findByRole(
                        Role.NURSE
                );
                break;

            case "USER":

                Long targetUserId = request.getTargetUserId();
                if (targetUserId == null) throw new IllegalArgumentException("Target user ID cannot be null");
                User user = userRepository
                        .findById(targetUserId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

                recipients.add(
                        user
                );

                break;

            default:
                throw new RuntimeException(
                        "Invalid target type"
                );
        }

        for (User recipient : recipients) {

            // Save locally
            Alert alert = new Alert();

            alert.setTargetEmail(
                    recipient.getEmail()
            );

            alert.setType(
                request.getAlertType()
            );

            alert.setMessage(
                    request.getMessage()
            );

            alertRepository.save(
                    alert
            );

            notificationClientService.sendNotification(
                recipient.getId(),
                recipient.getRole().name(),
               request.getAlertType().substring(0,1)
                        + request.getAlertType().substring(1).toLowerCase(),
                request.getMessage(),
                NotificationType.ADMIN_ALERT
           );
        }
    }

    public List<Alert> getUserAlerts(
            String email,
            String role
    ) {

        return alertRepository
                .findByTargetEmailOrderByCreatedAtDesc(
                        email
                );
    }

    public void markAsRead(Long id) {

        Alert alert = alertRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Alert not found"
                        )
                );

        alert.setRead(
                true
        );

        alertRepository.save(
                alert
        );
    }
}