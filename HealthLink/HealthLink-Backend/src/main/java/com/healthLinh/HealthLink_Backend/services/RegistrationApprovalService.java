package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.RegistrationRequest;
import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.ApprovalStatus;
import com.healthLinh.HealthLink_Backend.Enums.ApproverScope;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.Repositories.RegistrationRequestRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import com.healthLinh.HealthLink_Backend.dtos.registration.RegistrationRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Manages the approval queue for registrations that require human review.
 *
 * Routing matrix (set at registration time by {@link #createApprovalRequest}):
 * ┌──────────────┬──────────────────────────┬─────────────────────────────────┐
 * │ Role         │ ApproverScope            │ Who can approve / reject        │
 * ├──────────────┼──────────────────────────┼─────────────────────────────────┤
 * │ ADMIN        │ SUPER_ADMIN_ONLY         │ SuperAdmin only                 │
 * │ DOCTOR/NURSE │ ADMIN_AND_SUPER_ADMIN    │ Any Admin or SuperAdmin         │
 * │ PATIENT      │ (no request created)     │ auto-activated at registration  │
 * └──────────────┴──────────────────────────┴─────────────────────────────────┘
 *
 * This service intentionally does NOT extend or call AuthService / AdminService
 * so that existing behaviour is preserved without modification.
 */
@SuppressWarnings("null")
@Service
public class RegistrationApprovalService {

    private static final Logger log = LoggerFactory.getLogger(RegistrationApprovalService.class);

    private final RegistrationRequestRepository requestRepo;
    private final UserRepo userRepo;

    public RegistrationApprovalService(RegistrationRequestRepository requestRepo,
                                       UserRepo userRepo) {
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Called by AuthService after saving the User (no modification to AuthService
    // logic – this is purely additive).
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Creates an approval request for roles that require manual review.
     * Safe to call for PATIENT as well – the method simply returns without
     * persisting anything.
     */
    @Transactional
    public void createApprovalRequest(User user) {
        ApproverScope scope = resolveScope(user.getRole());
        if (scope == null) {
            // PATIENT – no approval needed
            return;
        }

        RegistrationRequest request = new RegistrationRequest();
        request.setUser(user);
        request.setApproverScope(scope);
        request.setApprovalStatus(ApprovalStatus.PENDING);
        requestRepo.save(request);

        log.info("Approval request created for user '{}' (role={}, scope={}).",
                user.getEmail(), user.getRole(), scope);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Queue views
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Pending requests visible to a regular Admin:
     * DOCTOR and NURSE registrations only (ADMIN_AND_SUPER_ADMIN scope).
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getPendingForAdmin() {
        return requestRepo
                .findByApprovalStatusAndApproverScopeIn(
                        ApprovalStatus.PENDING,
                        List.of(ApproverScope.ADMIN_AND_SUPER_ADMIN))
                .stream()
                .map(RegistrationRequestDTO::from)
                .toList();
    }

    /**
     * All pending requests visible to SuperAdmin (all scopes).
     */
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getPendingForSuperAdmin() {
        return requestRepo
                .findByApprovalStatus(ApprovalStatus.PENDING)
                .stream()
                .map(RegistrationRequestDTO::from)
                .toList();
    }

    /**
     * All requests (any status) – SuperAdmin audit view.
     */
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public List<RegistrationRequestDTO> getAllRequests() {
        return requestRepo.findAll()
                .stream()
                .map(RegistrationRequestDTO::from)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Approve
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Approve a registration request.
     *
     * Access rules (enforced here AND at URL level in SecurityConfig):
     *  - SUPER_ADMIN_ONLY scope  → only SUPER_ADMIN may approve.
     *  - ADMIN_AND_SUPER_ADMIN   → ADMIN or SUPER_ADMIN may approve.
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public RegistrationRequestDTO approve(Long requestId, String actorRole) {
        RegistrationRequest req = findPendingRequest(requestId);
        assertActorMayAct(req, actorRole);

        // Activate the user
        User user = req.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepo.save(user);

        // Resolve the request
        req.setApprovalStatus(ApprovalStatus.APPROVED);
        req.setResolvedAt(LocalDateTime.now());
        requestRepo.save(req);

        log.info("Registration request #{} approved by {} – user '{}' is now ACTIVE.",
                requestId, actorRole, user.getEmail());

        return RegistrationRequestDTO.from(req);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Reject
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Reject a registration request.
     * The user account remains PENDING (i.e. cannot log in) and the request
     * is marked REJECTED with an optional reason.
     *
     * Rejected users are NOT deleted so that audit history is preserved.
     * The account stays PENDING (login is still blocked by AuthService).
     */
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public RegistrationRequestDTO reject(Long requestId, String actorRole, String reason) {
        RegistrationRequest req = findPendingRequest(requestId);
        assertActorMayAct(req, actorRole);

        // Keep user PENDING (blocked from login) – do NOT suspend; the account
        // was never activated, so PENDING is the correct terminal state here.
        // If re-submission is desired in future the status can be updated.
        User user = req.getUser();
        user.setStatus(UserStatus.SUSPENDED);   // explicitly mark as rejected/blocked
        userRepo.save(user);

        req.setApprovalStatus(ApprovalStatus.REJECTED);
        req.setRejectionReason(reason);
        req.setResolvedAt(LocalDateTime.now());
        requestRepo.save(req);

        log.info("Registration request #{} rejected by {} – user '{}' suspended. Reason: {}",
                requestId, actorRole, user.getEmail(), reason);

        return RegistrationRequestDTO.from(req);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private RegistrationRequest findPendingRequest(@org.springframework.lang.NonNull Long requestId) {
        RegistrationRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Registration request not found: " + requestId));

        if (req.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new RuntimeException(
                    "Request #" + requestId + " is already " + req.getApprovalStatus() + ".");
        }
        return req;
    }

    /**
     * Ensures the acting role is allowed to resolve this particular request.
     *
     * @param req       the pending request
     * @param actorRole the Spring Security role string (e.g. "ROLE_ADMIN")
     */
    private void assertActorMayAct(RegistrationRequest req, String actorRole) {
        boolean isSuperAdmin = actorRole.contains("SUPER_ADMIN");

        if (req.getApproverScope() == ApproverScope.SUPER_ADMIN_ONLY && !isSuperAdmin) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only a SuperAdmin may approve or reject Admin registration requests.");
        }
        // ADMIN_AND_SUPER_ADMIN: both ADMIN and SUPER_ADMIN are permitted – no further check.
    }

    /**
     * Maps a role to its required ApproverScope.
     * Returns {@code null} for PATIENT (no approval request needed).
     */
    private ApproverScope resolveScope(Role role) {
        return switch (role) {
            case ADMIN -> ApproverScope.SUPER_ADMIN_ONLY;
            case DOCTOR, NURSE -> ApproverScope.ADMIN_AND_SUPER_ADMIN;
            default -> null;  // PATIENT, SUPER_ADMIN
        };
    }
}
