package com.healthLinh.HealthLink_Backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healthLinh.HealthLink_Backend.Entities.Transaction;
import com.healthLinh.HealthLink_Backend.Entities.User;

import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;

import com.healthLinh.HealthLink_Backend.Repositories.TransactionRepo;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;

import com.healthLinh.HealthLink_Backend.dtos.billing.AdminTransactionDTO;
import com.healthLinh.HealthLink_Backend.dtos.billing.TransactionDTO;

@Service
public class BillingService {

    private final TransactionRepo transactionRepo;
    private final UserRepo userRepo;
    private final NotificationClientService notificationClientService;

    public BillingService(
            TransactionRepo transactionRepo,
            UserRepo userRepo,
            NotificationClientService notificationClientService
    ) {
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.notificationClientService = notificationClientService;
    }

    @Transactional
    public TransactionDTO topUp(
            String email,
            Double amount,
            String method
    ) {

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        User user = userRepo.findByEmailForUpdate(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        double currentBalance =
                getCurrentBalanceInternal(
                        user.getId()
                );

        double updatedBalance =
                currentBalance + amount;

        Transaction tx = new Transaction();

        tx.setUser(user);
        tx.setType("TOPUP");
        tx.setAmount(amount);
        tx.setBalanceAfter(updatedBalance);

        tx.setMethod(
                (method == null || method.isBlank())
                        ? "UNKNOWN"
                        : method.trim().toUpperCase()
        );

        tx.setStatus("SUCCESS");
        tx.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(tx);

        // Patient notification
        notificationClientService.sendNotification(
                user.getId(),
                "PATIENT",
                "Wallet Balance Updated",
                "EGP " + amount + " has been added to your wallet.",
                NotificationType.PAYMENT
        );

        notifyAdmins(
                "Wallet Top-Up",
                user.getFullName() + " added EGP " + amount + " to wallet."
        );

        return new TransactionDTO(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getBalanceAfter(),
                tx.getMethod(),
                tx.getStatus(),
                tx.getAppointmentId(),
                tx.getCreatedAt()
        );
    }

    @Transactional
    public TransactionDTO refund(
            String email,
            Double amount,
            Long appointmentId
    ) {

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        User user = userRepo.findByEmailForUpdate(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        double currentBalance =
                getCurrentBalanceInternal(
                        user.getId()
                );

        double updatedBalance =
                currentBalance + amount;

        Transaction tx = new Transaction();

        tx.setUser(user);
        tx.setType("REFUND");
        tx.setAmount(amount);
        tx.setBalanceAfter(updatedBalance);

        tx.setMethod("WALLET");
        tx.setStatus("SUCCESS");

        tx.setAppointmentId(appointmentId);
        tx.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(tx);

        notificationClientService.sendNotification(
                user.getId(),
                "PATIENT",
                "Wallet Refunded",
                "EGP " + amount + " has been refunded to your wallet.",
                NotificationType.PAYMENT
        );

        notifyAdmins(
                "Refund Processed",
                "Refund completed for " + user.getFullName()
        );

        return new TransactionDTO(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getBalanceAfter(),
                tx.getMethod(),
                tx.getStatus(),
                tx.getAppointmentId(),
                tx.getCreatedAt()
        );
    }

    @Transactional
    public TransactionDTO deduct(
            String email,
            Double amount,
            Long appointmentId
    ) {

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }

        User user = userRepo.findByEmailForUpdate(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        double currentBalance =
                getCurrentBalanceInternal(
                        user.getId()
                );

        if (amount > currentBalance) {
            throw new IllegalArgumentException(
                    "Insufficient balance"
            );
        }

        double updatedBalance =
                currentBalance - amount;

        Transaction tx = new Transaction();

        tx.setUser(user);
        tx.setType("DEDUCT");

        tx.setAmount(amount);
        tx.setBalanceAfter(updatedBalance);

        tx.setMethod("WALLET");
        tx.setStatus("SUCCESS");

        tx.setAppointmentId(appointmentId);
        tx.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(tx);

        notificationClientService.sendNotification(
                user.getId(),
                "PATIENT",
                "Payment Successful",
                "Appointment fee has been deducted from your wallet.",
                NotificationType.PAYMENT
        );

        notifyAdmins(
                "Appointment Payment",
                user.getFullName() + " paid EGP " + amount
        );

        return new TransactionDTO(
                tx.getId(),
                tx.getType(),
                tx.getAmount(),
                tx.getBalanceAfter(),
                tx.getMethod(),
                tx.getStatus(),
                tx.getAppointmentId(),
                tx.getCreatedAt()
        );
    }

    private void notifyAdmins(
            String title,
            String message
    ) {

        List<User> admins =
                userRepo.findByRole(
                        Role.ADMIN
                );

        List<User> superAdmins =
                userRepo.findByRole(
                        Role.SUPER_ADMIN
                );

        admins.forEach(admin ->
                notificationClientService.sendNotification(
                        admin.getId(),
                        "ADMIN",
                        title,
                        message,
                        NotificationType.PAYMENT
                )
        );

        superAdmins.forEach(superAdmin ->
                notificationClientService.sendNotification(
                        superAdmin.getId(),
                        "SUPER_ADMIN",
                        title,
                        message,
                        NotificationType.PAYMENT
                )
        );
    }

    @Transactional(readOnly = true)
    public double getCurrentBalance(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return getCurrentBalanceInternal(
                user.getId()
        );
    }

    private double getCurrentBalanceInternal(
            Long userId
    ) {

        return transactionRepo
                .findTopByUserIdOrderByCreatedAtDescIdDesc(
                        userId
                )
                .map(Transaction::getBalanceAfter)
                .orElse(0.0);
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactions(
            String email
    ) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return transactionRepo
                .findByUserIdOrderByCreatedAtDescIdDesc(
                        user.getId()
                )
                .stream()
                .map(tx -> new TransactionDTO(
                        tx.getId(),
                        tx.getType(),
                        tx.getAmount(),
                        tx.getBalanceAfter(),
                        tx.getMethod(),
                        tx.getStatus(),
                        tx.getAppointmentId(),
                        tx.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminTransactionDTO>
    getAllTransactions() {

        return transactionRepo.findAll()
                .stream()
                .sorted((t1, t2) ->
                        t2.getCreatedAt()
                                .compareTo(
                                        t1.getCreatedAt()
                                )
                )
                .map(tx ->
                        new AdminTransactionDTO(
                                tx.getId(),
                                tx.getUser().getFullName(),
                                tx.getType(),
                                tx.getAmount(),
                                tx.getMethod(),
                                tx.getStatus(),
                                tx.getCreatedAt()
                        )
                )
                .collect(Collectors.toList());
    }
}