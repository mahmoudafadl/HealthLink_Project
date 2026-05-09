package com.healthLinh.HealthLink_Backend.dtos.billing;

import java.time.LocalDateTime;

public record AdminTransactionDTO(
    Long id,
    String patientName,
    String type,
    Double amount,
    String method,
    String status,
    LocalDateTime createdAt
) {}
