package com.healthLinh.HealthLink_Backend.Entities;

import com.healthLinh.HealthLink_Backend.Enums.ApprovalStatus;
import com.healthLinh.HealthLink_Backend.Enums.ApproverScope;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Tracks every registration that requires manual approval.
 *
 * Routing rules (populated by RegistrationApprovalService):
 *  • ADMIN role      → approverScope = SUPER_ADMIN_ONLY
 *  • DOCTOR / NURSE  → approverScope = ADMIN_AND_SUPER_ADMIN
 *  • PATIENT         → never created (auto-activated)
 *
 * This entity is append-only from AuthService and is acted upon
 * exclusively by Admin / SuperAdmin approval endpoints.
 */
@Data
@Entity
@Table(name = "registration_requests")
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user whose account is awaiting approval. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Which actor(s) may approve this request.
     * Stored as STRING so future scopes can be added without a migration.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApproverScope approverScope;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    /** Free-text reason captured when a request is rejected. */
    @Column(length = 500)
    private String rejectionReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;
}
