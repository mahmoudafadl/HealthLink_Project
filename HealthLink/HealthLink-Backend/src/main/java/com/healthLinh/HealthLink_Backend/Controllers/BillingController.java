package com.healthLinh.HealthLink_Backend.Controllers;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.healthLinh.HealthLink_Backend.dtos.billing.AdminTransactionDTO;
import com.healthLinh.HealthLink_Backend.dtos.billing.BalanceResponse;
import com.healthLinh.HealthLink_Backend.dtos.billing.BillingResponse;
import com.healthLinh.HealthLink_Backend.dtos.billing.DeductRequest;
import com.healthLinh.HealthLink_Backend.dtos.billing.TopUpRequest;
import com.healthLinh.HealthLink_Backend.dtos.billing.TransactionDTO;
import com.healthLinh.HealthLink_Backend.services.BillingService;

@RestController
@RequestMapping("/api/billing")
public class BillingController {
    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    private String getEmailFromAuth(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return principal.getName();
    }

    @PostMapping("/topup")
    @ResponseStatus(HttpStatus.CREATED)
    public BillingResponse topUp(Principal principal, @Valid @RequestBody TopUpRequest request) {
        TransactionDTO tx = billingService.topUp(getEmailFromAuth(principal), request.amount(), request.method());
        return new BillingResponse("SUCCESS", tx.balanceAfter(), "Top up successful");
    }

    @PostMapping("/deduct")
    public BillingResponse deduct(Principal principal, @Valid @RequestBody DeductRequest request) {
        TransactionDTO tx = billingService.deduct(getEmailFromAuth(principal), request.amount(), request.appointmentId());
        return new BillingResponse("SUCCESS", tx.balanceAfter(), "Deduction successful");
    }

    @GetMapping("/balance")
    public BalanceResponse balance(Principal principal) {
        return new BalanceResponse(null, billingService.getCurrentBalance(getEmailFromAuth(principal)));
    }

    @GetMapping("/transactions")
    public List<TransactionDTO> transactions(Principal principal) {
        return billingService.getTransactions(getEmailFromAuth(principal));
    }

    @GetMapping("/admin/transactions")
    public List<AdminTransactionDTO> allTransactions() {
        return billingService.getAllTransactions();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
