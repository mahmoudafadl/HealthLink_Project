package com.healthLinh.HealthLink_Backend.Controllers;

import com.healthLinh.HealthLink_Backend.dtos.registration.RejectRequestDTO;
import com.healthLinh.HealthLink_Backend.dtos.registration.RegistrationRequestDTO;
import com.healthLinh.HealthLink_Backend.services.RegistrationApprovalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Exposes the registration-approval queue.
 *
 * URL structure:
 *   GET  /registrations/pending          → Admin + SuperAdmin (Doctor/Nurse queue)
 *   GET  /registrations/pending/all      → SuperAdmin only (all scopes incl. Admin requests)
 *   GET  /registrations/all              → SuperAdmin only (full audit history)
 *   PUT  /registrations/{id}/approve     → Admin + SuperAdmin (scope-guarded inside service)
 *   PUT  /registrations/{id}/reject      → Admin + SuperAdmin (scope-guarded inside service)
 *
 * Existing /admin/** and /superadmin/** endpoints are NOT modified.
 */
@RestController
@RequestMapping("/api/registrations")
public class RegistrationApprovalController {

    private final RegistrationApprovalService approvalService;

    public RegistrationApprovalController(RegistrationApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    // ─── Pending queue – Admin view (Doctor + Nurse only) ────────────────────
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getPendingForAdmin() {
        return approvalService.getPendingForAdmin();
    }

    // ─── Pending queue – SuperAdmin full view (all scopes) ───────────────────
    @GetMapping("/pending/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getPendingForSuperAdmin() {
        return approvalService.getPendingForSuperAdmin();
    }

    // ─── Full audit history – SuperAdmin only ────────────────────────────────
    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getAllRequests() {
        return approvalService.getAllRequests();
    }

    // ─── Approve ─────────────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public RegistrationRequestDTO approve(@PathVariable Long id,
                                          Authentication authentication) {
        String actorRole = authentication.getAuthorities().stream()
                .map(Object::toString)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .orElse("UNKNOWN");

        return approvalService.approve(id, actorRole);
    }

    // ─── Reject ──────────────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public RegistrationRequestDTO reject(@PathVariable Long id,
                                         @RequestBody(required = false) RejectRequestDTO body,
                                         Authentication authentication) {
        String actorRole = authentication.getAuthorities().stream()
                .map(Object::toString)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .orElse("UNKNOWN");

        String reason = (body != null) ? body.reason() : null;
        return approvalService.reject(id, actorRole, reason);
    }
}
