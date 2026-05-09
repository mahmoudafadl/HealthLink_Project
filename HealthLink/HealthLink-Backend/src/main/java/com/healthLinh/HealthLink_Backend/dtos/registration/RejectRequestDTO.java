package com.healthLinh.HealthLink_Backend.dtos.registration;

/**
 * Optional request body when rejecting a registration request.
 * The {@code reason} field is optional; omitting it is allowed.
 */
public record RejectRequestDTO(String reason) {}
