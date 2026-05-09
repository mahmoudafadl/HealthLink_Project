package com.healthLinh.HealthLink_Backend.Config;

import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class DbFixConfig {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void fixNurseIdConstraint() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE home_service_requests MODIFY COLUMN nurse_id BIGINT NULL");
            System.out.println("✅ Database Fix: nurse_id is now nullable.");
        } catch (Exception e) {
            System.err.println("❌ Database Fix Failed: " + e.getMessage());
        }
    }
}
