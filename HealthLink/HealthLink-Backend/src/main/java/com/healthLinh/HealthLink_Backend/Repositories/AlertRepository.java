package com.healthLinh.HealthLink_Backend.Repositories;

import com.healthLinh.HealthLink_Backend.Entities.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByTargetEmailOrderByCreatedAtDesc(String targetEmail);
    List<Alert> findByTargetEmailInOrderByCreatedAtDesc(List<String> targetEmails);
}
