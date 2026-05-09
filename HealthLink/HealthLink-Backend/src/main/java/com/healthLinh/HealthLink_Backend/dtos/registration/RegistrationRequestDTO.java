package com.healthLinh.HealthLink_Backend.dtos.registration;

import com.healthLinh.HealthLink_Backend.Entities.RegistrationRequest;
import com.healthLinh.HealthLink_Backend.Enums.ApprovalStatus;
import com.healthLinh.HealthLink_Backend.Enums.ApproverScope;
import com.healthLinh.HealthLink_Backend.Enums.Role;

import java.time.LocalDateTime;

/**
 * Safe, flat projection of a {@link RegistrationRequest} returned to callers.
 * Password hash and other sensitive fields are never exposed.
 */
public record RegistrationRequestDTO(
        Long requestId,
        Long userId,
        String fullName,
        String email,
        Role role,
        ApproverScope approverScope,
        ApprovalStatus approvalStatus,
        String rejectionReason,
        LocalDateTime requestedAt,
        LocalDateTime resolvedAt
) {
    public static RegistrationRequestDTO from(RegistrationRequest r) {
        return new RegistrationRequestDTO(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getFullName(),
                r.getUser().getEmail(),
                r.getUser().getRole(),
                r.getApproverScope(),
                r.getApprovalStatus(),
                r.getRejectionReason(),
                r.getRequestedAt(),
                r.getResolvedAt()
        );
    }
}
