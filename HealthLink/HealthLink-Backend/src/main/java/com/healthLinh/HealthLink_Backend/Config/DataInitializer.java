package com.healthLinh.HealthLink_Backend.Config;

import com.healthLinh.HealthLink_Backend.Entities.User;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the fixed SuperAdmin account on application startup.
 *
 * The SuperAdmin:
 *  - Is identified by the reserved email defined in SUPER_ADMIN_EMAIL.
 *  - Is created only if it does not already exist in the database.
 *  - Cannot be created or deleted through any API endpoint.
 *  - Credentials should be overridden via environment variables in production.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // ── Override these via env vars / application.properties in production ─────
    static final String SUPER_ADMIN_EMAIL    = System.getenv().getOrDefault(
            "SUPERADMIN_EMAIL",    "superadmin@gmail.com");
    static final String SUPER_ADMIN_PASSWORD = System.getenv().getOrDefault(
            "SUPERADMIN_PASSWORD", "SuperAdmin1");
    static final String SUPER_ADMIN_NAME     = "System SuperAdmin";

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepo.existsByEmail(SUPER_ADMIN_EMAIL)) {
            log.info("[INIT] SuperAdmin already exists – skipping seed.");
            return;
        }

        User superAdmin = new User();
        superAdmin.setFullName(SUPER_ADMIN_NAME);
        superAdmin.setEmail(SUPER_ADMIN_EMAIL);
        superAdmin.setPasswordHash(passwordEncoder.encode(SUPER_ADMIN_PASSWORD));
        superAdmin.setRole(Role.SUPER_ADMIN);
        superAdmin.setStatus(UserStatus.ACTIVE);

        userRepo.save(superAdmin);
        log.info("[INIT] SuperAdmin account seeded: {}", SUPER_ADMIN_EMAIL);
    }
}
