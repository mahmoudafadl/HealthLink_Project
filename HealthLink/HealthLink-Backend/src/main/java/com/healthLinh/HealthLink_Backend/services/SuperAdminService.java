package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import com.healthLinh.HealthLink_Backend.dtos.CreateAdminRequestDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * SuperAdmin service – exclusive to the SUPER_ADMIN role.
 *
 * Responsibilities:
 *  - Create Admin users
 *  - Suspend / re-activate Admin users
 *  - List all Admin users
 *
 * The SuperAdmin account itself is seeded at startup (DataInitializer)
 * and cannot be deleted or created through any API.
 */
@SuppressWarnings("null")
@Service
public class SuperAdminService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // ─── Create Admin ─────────────────────────────────────────────────────────

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public User createAdmin(CreateAdminRequestDTO dto) {
        if (userRepo.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User admin = new User();
        admin.setFullName(dto.getFullName());
        admin.setEmail(dto.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);   // Admin accounts are immediately active

        return userRepo.save(admin);
    }

    // ─── List all Admins ──────────────────────────────────────────────────────

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<User> getAllAdmins() {
        return userRepo.findByRole(Role.ADMIN);
    }

    // ─── Suspend / Reactivate Admin ───────────────────────────────────────────

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public User suspendAdmin(Long id) {
        User admin = getAdminById(id);
        admin.setStatus(UserStatus.SUSPENDED);
        return userRepo.save(admin);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public User reactivateAdmin(Long id) {
        User admin = getAdminById(id);
        admin.setStatus(UserStatus.ACTIVE);
        return userRepo.save(admin);
    }

    // ─── List all users (full system view) ───────────────────────────────────

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private User getAdminById(@org.springframework.lang.NonNull Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Target user is not an Admin");
        }

        return user;
    }
}
