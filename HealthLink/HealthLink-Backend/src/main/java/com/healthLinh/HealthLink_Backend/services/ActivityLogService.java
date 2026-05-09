package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.ActivityLog;
import com.healthLinh.HealthLink_Backend.Repositories.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void logActivity(String email, String role, String action, String details) {
        ActivityLog log = new ActivityLog();
        log.setUserEmail(email);
        log.setRole(role);
        log.setAction(action);
        log.setDetails(details);
        repository.save(log);
    }

    public List<ActivityLog> getAllLogs() {
        return repository.findAllByOrderByTimestampDesc();
    }
}
