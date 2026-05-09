package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.Alert;
import com.healthLinh.HealthLink_Backend.dtos.AlertRequest;
import com.healthLinh.HealthLink_Backend.services.AlertService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(
            AlertService alertService
    ) {

        this.alertService =
                alertService;
    }

    /*
     * Admin send alert
     */
    @PostMapping("/send")
    public String sendAlert(
            @RequestBody AlertRequest request
    ) {

        alertService.sendAdminAlert(
                request
        );

        return "Alert sent successfully";
    }

    /*
     * Logged in doctor/nurse gets own alerts
     */
    @GetMapping("/my")
    public List<Alert> getMyAlerts() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                auth.getName();

        String role =
                auth.getAuthorities()
                        .stream()
                        .map(a ->
                                a.getAuthority()
                                        .replace(
                                                "ROLE_",
                                                ""
                                        )
                        )
                        .findFirst()
                        .orElse(
                                ""
                        );

        return alertService.getUserAlerts(
                email,
                role
        );
    }

    /*
     * Mark alert as read
     */
    @PutMapping("/{id}/read")
    public void markAsRead(
            @PathVariable Long id
    ) {

        alertService.markAsRead(
                id
        );
    }
}