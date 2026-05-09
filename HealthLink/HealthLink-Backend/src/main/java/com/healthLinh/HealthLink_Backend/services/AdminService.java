package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Repositories.RegistrationRequestRepository;
import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Admin service – regular Admins can approve/reject Doctors and Nurses only.
 *
 * Business rules enforced here (complementing URL-level SecurityConfig):
 *  - Admins cannot touch SUPER_ADMIN or ADMIN accounts.
 *  - Admins cannot approve/reject PATIENT accounts (patients self-activate).
 *  - Full user listing is available to Admins and SuperAdmins.
 */
@Service
public class AdminService {

    private final UserRepo userRepo;
    private final RegistrationRequestRepository registrationRequestRepository;
    

    public AdminService(UserRepo userRepo, RegistrationRequestRepository registrationRequestRepository) {
        this.userRepo = userRepo;
        this.registrationRequestRepository = registrationRequestRepository;
    }

    // ─── Read operations ──────────────────────────────────────────────────────

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<User> getPendingUsers() {
        return userRepo.findByStatus(UserStatus.PENDING);
    }

    // ─── Approve ──────────────────────────────────────────────────────────────

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public User approve(@org.springframework.lang.NonNull Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertAdminCanManage(user);

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("User already active");
        }

        user.setStatus(UserStatus.ACTIVE);
        return userRepo.save(user);
    }

    // ─── Reject / Suspend ─────────────────────────────────────────────────────

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public User reject(@org.springframework.lang.NonNull Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        assertAdminCanManage(user);

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("User already rejected/suspended");
        }

        user.setStatus(UserStatus.SUSPENDED);
        return userRepo.save(user);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public User toggleUserStatus(
        @org.springframework.lang.NonNull Long id
    ) {

        User user = userRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        assertAdminCanManage(user);

        if (user.getStatus() == UserStatus.ACTIVE) {

            registrationRequestRepository.deleteByUserId(id);

            user.setStatus(UserStatus.SUSPENDED);

        } else if (user.getStatus() == UserStatus.SUSPENDED) {

            user.setStatus(UserStatus.ACTIVE);
        }

        return userRepo.save(user);
    }
    // ─── Guard ────────────────────────────────────────────────────────────────

    /**
     * Regular Admins may only manage DOCTOR and NURSE accounts.
     * SUPER_ADMIN accounts are completely off-limits to regular Admins.
     * PATIENT accounts self-activate and do not require admin approval.
     */
    private void assertAdminCanManage(User target) {
        Role role = target.getRole();

        if (role == Role.SUPER_ADMIN) {
            throw new RuntimeException("SuperAdmin accounts cannot be managed by Admins.");
        }

        if (role == Role.ADMIN) {
            throw new RuntimeException(
                    "Admin accounts can only be managed by the SuperAdmin.");
        }

        if (role == Role.PATIENT) {
            throw new RuntimeException(
                    "Patient accounts are automatically activated and do not require approval.");
        }
    }
}
