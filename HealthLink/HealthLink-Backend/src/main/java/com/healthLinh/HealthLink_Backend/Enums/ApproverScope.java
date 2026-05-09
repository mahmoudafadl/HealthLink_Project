package com.healthLinh.HealthLink_Backend.Enums;

/**
 * Defines which actor(s) are authorised to approve a
 * {@link com.healthLinh.HealthLink_Backend.Entities.RegistrationRequest}.
 *
 * <ul>
 *   <li>{@code SUPER_ADMIN_ONLY} – used for ADMIN registrations; only
 *       the SuperAdmin may approve or reject.</li>
 *   <li>{@code ADMIN_AND_SUPER_ADMIN} – used for DOCTOR / NURSE
 *       registrations; either an Admin or the SuperAdmin may act.</li>
 * </ul>
 */
public enum ApproverScope {
    SUPER_ADMIN_ONLY,
    ADMIN_AND_SUPER_ADMIN
}
