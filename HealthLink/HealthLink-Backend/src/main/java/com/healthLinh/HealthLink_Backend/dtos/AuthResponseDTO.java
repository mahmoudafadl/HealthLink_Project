package com.healthLinh.HealthLink_Backend.dtos;

import com.healthLinh.HealthLink_Backend.Entities.User;

/**
 * Unified authentication / registration response.
 *
 * Fields:
 *  - {@code token}   – JWT; {@code null} when the account is PENDING (not yet approved).
 *  - {@code user}    – full user record.
 *  - {@code message} – human-readable status message (e.g. approval-pending notice).
 *
 * Keeping {@code token} as {@code null} for PENDING accounts is intentional:
 * it prevents the frontend from accidentally using the token to access
 * authenticated endpoints before approval is granted.
 */
public record AuthResponseDTO(String token, User user, String message) {

    /** Convenience factory for a fully authenticated (ACTIVE) user. */
    public static AuthResponseDTO authenticated(String token, User user) {
        return new AuthResponseDTO(token, user, null);
    }

    /** Factory for a newly registered user whose account is awaiting approval. */
    public static AuthResponseDTO pendingApproval(User user, String approvalMessage) {
        return new AuthResponseDTO(null, user, approvalMessage);
    }

    /**
     * Legacy-compatible two-arg constructor; sets message to null.
     * Keeps any existing callers that do {@code new AuthResponseDTO(token, user)} compiling.
     */
    public AuthResponseDTO(String token, User user) {
        this(token, user, null);
    }
}
