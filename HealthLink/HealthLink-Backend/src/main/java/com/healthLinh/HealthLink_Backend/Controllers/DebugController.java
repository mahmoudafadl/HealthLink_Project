package com.healthLinh.HealthLink_Backend.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/db-check")
    public Map<String, Object> checkDb() {
        try {
            Long uCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);
            Long aCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM appointments", Long.class);
            Long dCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctor_profiles", Long.class);
            
            long userCount = (uCount != null) ? uCount : 0L;
            long apptCount = (aCount != null) ? aCount : 0L;
            long doctorCount = (dCount != null) ? dCount : 0L;
            
            List<Map<String, Object>> doctors = jdbcTemplate.queryForList("SELECT id, user_id FROM doctor_profiles");
            List<Map<String, Object>> recentAppts = jdbcTemplate.queryForList("SELECT id, doctor_id, patient_id, status FROM appointments LIMIT 5");

            return Map.of(
                "userCount", userCount,
                "apptCount", apptCount,
                "doctorCount", doctorCount,
                "doctors", doctors,
                "recentAppts", recentAppts,
                "status", "success"
            );
        } catch (Exception e) {
            return Map.of("error", e.getMessage(), "status", "error");
        }
    }
}
