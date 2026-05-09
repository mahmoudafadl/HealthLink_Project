package com.healthLinh.HealthLink_Backend.dtos.billing;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TopUpRequest(
        @NotNull(message = "Amount is required") 
        @Positive(message = "Amount must be greater than zero") 
        Double amount, 
        
        String method
) {}
