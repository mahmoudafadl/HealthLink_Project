package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepo extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findTopByUserIdOrderByCreatedAtDescIdDesc(Long userId);
    List<Transaction> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}
