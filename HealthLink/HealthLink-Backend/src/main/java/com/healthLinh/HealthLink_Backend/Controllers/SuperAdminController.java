package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.dtos.CreateAdminRequestDTO;
import com.healthLinh.HealthLink_Backend.services.SuperAdminService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SuperAdmin-only endpoints.
 * URL-level guard: /superadmin/** → hasRole('SUPER_ADMIN') in SecurityConfig.
 * Method-level guard: @PreAuthorize on each service method (defense-in-depth).
 */
@RestController
@RequestMapping("/api/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    // ─── Create Admin ─────────────────────────────────────────────────────────
    @PostMapping("/admins")
    public User createAdmin(@RequestBody @Valid CreateAdminRequestDTO dto) {
        return superAdminService.createAdmin(dto);
    }

    // ─── List Admins ──────────────────────────────────────────────────────────
    @GetMapping("/admins")
    public List<User> getAllAdmins() {
        return superAdminService.getAllAdmins();
    }

    // ─── Suspend Admin ────────────────────────────────────────────────────────
    @PutMapping("/admins/{id}/suspend")
    public User suspendAdmin(@PathVariable Long id) {
        return superAdminService.suspendAdmin(id);
    }

    // ─── Reactivate Admin ─────────────────────────────────────────────────────
    @PutMapping("/admins/{id}/reactivate")
    public User reactivateAdmin(@PathVariable Long id) {
        return superAdminService.reactivateAdmin(id);
    }

    // ─── Full system user list ────────────────────────────────────────────────
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return superAdminService.getAllUsers();
    }
}
