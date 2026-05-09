package com.healthLinh.HealthLink_Backend.services;

import com.healthLinh.HealthLink_Backend.Entities.DoctorProfile;
import com.healthLinh.HealthLink_Backend.Entities.User;

import com.healthLinh.HealthLink_Backend.Enums.NotificationType;
import com.healthLinh.HealthLink_Backend.Enums.Role;
import com.healthLinh.HealthLink_Backend.Enums.UserStatus;

import com.healthLinh.HealthLink_Backend.Repositories.DoctorProfileRepository;
import com.healthLinh.HealthLink_Backend.Repositories.UserRepo;

import com.healthLinh.HealthLink_Backend.dtos.RegisterRequestDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    AuthService.class
            );

    private final UserRepo userRepo;
    private final DoctorProfileRepository doctorRepo;

    private final PasswordEncoder passwordEncoder;

    private final RegistrationApprovalService approvalService;

    private final NotificationClientService notificationClientService;

    public AuthService(
            UserRepo userRepo,
            DoctorProfileRepository doctorRepo,
            PasswordEncoder passwordEncoder,
            RegistrationApprovalService approvalService,
            NotificationClientService notificationClientService
    ) {

        this.userRepo = userRepo;

        this.doctorRepo = doctorRepo;

        this.passwordEncoder = passwordEncoder;

        this.approvalService = approvalService;

        this.notificationClientService =
                notificationClientService;
    }

    // REGISTER
    public User register(
            RegisterRequestDTO dto
    ) {

        if (
                 dto.getRole() == Role.SUPER_ADMIN ||
                 dto.getRole() == Role.ADMIN
        ) {

                throw new RuntimeException(
                "Admin accounts cannot be self-registered."
                );
        }

        if (userRepo.existsByEmail(
                dto.getEmail()
        )) {

            throw new RuntimeException(
                    "Email already exists"
            );
        }

        User user = new User();

        user.setFullName(
                dto.getFullName()
        );

        user.setEmail(
                dto.getEmail()
        );

        user.setPasswordHash(
                passwordEncoder.encode(
                        dto.getPassword()
                )
        );

        user.setRole(
                dto.getRole()
        );

        // Status rules
        if (dto.getRole() == Role.PATIENT) {

            user.setStatus(
                    UserStatus.ACTIVE
            );

            log.info(
                    "Patient '{}' auto-activated.",
                    dto.getEmail()
            );

        } else {

            user.setStatus(
                    UserStatus.PENDING
            );

            log.info(
                    "User '{}' registered as {} and is pending approval.",
                    dto.getEmail(),
                    dto.getRole()
            );
        }

        User savedUser =
                userRepo.save(
                        user
                );

        // Doctor profile
        if (dto.getRole() == Role.DOCTOR) {

            if (dto.getSpecialization() == null ||
                    dto.getSpecialization().isBlank()) {

                throw new RuntimeException(
                        "Specialization is required for doctor"
                );
            }

            if (dto.getExperienceYears() == null) {

                throw new RuntimeException(
                        "Experience years is required for doctor"
                );
            }

            DoctorProfile profile =
                    new DoctorProfile();

            profile.setUser(
                    savedUser
            );

            profile.setSpecialization(
                    dto.getSpecialization()
            );

            profile.setExperienceYears(
                    dto.getExperienceYears()
            );

            profile.setRating(0.0);

            doctorRepo.save(
                    profile
            );
        }

        // Notify admins only for doctor/nurse registrations
        if (savedUser.getRole() == Role.DOCTOR ||
                savedUser.getRole() == Role.NURSE) {

            List<User> admins =
                    userRepo.findByRole(
                            Role.ADMIN
                    );

            admins.forEach(admin ->
                    notificationClientService.sendNotification(
                            admin.getId(),
                            "ADMIN",
                            "New Registration Request",
                            "A new " +
                                    savedUser.getRole()
                                            .name()
                                            .toLowerCase() +
                                    " registration is waiting for approval.",
                            NotificationType.ADMIN_ALERT
                    )
            );
        }

        // Create approval request
        approvalService.createApprovalRequest(
                savedUser
        );

        return savedUser;
    }

    // LOGIN
    public User login(
            String email,
            String password
    ) {

        User user = userRepo.findByEmail(
                        email
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid credentials"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPasswordHash()
        )) {

            throw new RuntimeException(
                    "Invalid credentials"
            );
        }

        if (user.getStatus() == UserStatus.PENDING) {

                log.warn(
                        "Login blocked for '{}' (PENDING approval).",
                        email
                );

                throw new RuntimeException(
                         "Your account is waiting for admin approval."
                );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {

                log.warn(
                        "Login blocked for '{}' (status={}).",
                         email,
                        user.getStatus()
                );

                 throw new RuntimeException(
                        "Your account is not active."
                );
        }

        return user;
    }
}