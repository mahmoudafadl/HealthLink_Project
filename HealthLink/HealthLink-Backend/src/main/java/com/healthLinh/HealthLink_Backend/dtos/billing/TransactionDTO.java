package com.healthLinh.HealthLink_Backend.dtos.billing;

import java.time.LocalDateTime;

public record TransactionDTO(Long id, String type, Double amount, Double balanceAfter, String method, String status, Long appointmentId, LocalDateTime createdAt) {}
