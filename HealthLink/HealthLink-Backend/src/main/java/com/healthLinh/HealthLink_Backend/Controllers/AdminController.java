package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.services.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.healthLinh.HealthLink_Backend.services.ActivityLogService;
import com.healthLinh.HealthLink_Backend.Entities.ActivityLog;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminController {

    private final AdminService service;
    private final ActivityLogService activityLogService;

    public AdminController(AdminService service, ActivityLogService activityLogService) {
        this.service = service;
        this.activityLogService = activityLogService;
    }

    // ─── All users ────────────────────────────────────────────────────────────
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // ─── Pending users ────────────────────────────────────────────────────────
    @GetMapping("/users/pending")
    public List<User> getPendingUsers() {
        return service.getPendingUsers();
    }

    // ─── Approve (Doctor / Nurse only) ────────────────────────────────────────
    @PutMapping("/approve/{id}")
    public User approve(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        return service.approve(id);
    }

    // ─── Reject / Suspend (Doctor / Nurse only) ───────────────────────────────
    @PutMapping("/reject/{id}")
    public User reject(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        return service.reject(id);
    }

    // manage nurse / doctor account 
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
         service.toggleUserStatus(id);
    }
    // ─── Activity Logs ────────────────────────────────────────────────────────
    @GetMapping("/logs")
    public List<ActivityLog> getLogs() {
        return activityLogService.getAllLogs();
    }
}
